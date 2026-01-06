import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UnavailabilityRequest from '@/models/UnavailabilityRequest';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

// GET - Get unavailability requests (filtered by role)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get('operatorId');
    const status = searchParams.get('status');

    let query: any = {};

    // Operators can only see their own requests
    if (user.role === 'operator') {
      query.operator = user._id;
    } else if (user.role === 'admin') {
      // Admins can see all requests, optionally filtered by operator
      if (operatorId) {
        query.operator = operatorId;
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const requests = await UnavailabilityRequest.find(query)
      .populate('operator', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Error fetching unavailability requests:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST - Create a new unavailability request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only operators can create requests
    if (user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden: Only operators can create unavailability requests' }, { status: 403 });
    }

    const { dates, reason } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'At least one date is required' }, { status: 400 });
    }

    // Validate dates are not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      if (date < now) {
        return NextResponse.json({ error: 'Cannot request unavailability for past dates' }, { status: 400 });
      }
    }

    // Create the request
    const unavailabilityRequest = await UnavailabilityRequest.create({
      operator: user._id,
      dates: dates.map((d: string) => new Date(d)),
      reason: reason || undefined,
      status: 'pending',
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    const operatorName = user.name || 'An operator';
    const dateCount = dates.length;
    const dateText = dateCount === 1 ? 'day' : 'days';

    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'unavailability_request',
        title: 'Unavailability Request',
        message: `${operatorName} has requested to be unavailable for ${dateCount} ${dateText}.`,
      });
    }

    const populated = await UnavailabilityRequest.findById(unavailabilityRequest._id)
      .populate('operator', 'name email')
      .lean();

    return NextResponse.json({ request: populated }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating unavailability request:', error);
    return NextResponse.json({ error: error.message || 'Failed to create request' }, { status: 500 });
  }
}


