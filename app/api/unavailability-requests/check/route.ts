import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UnavailabilityRequest from '@/models/UnavailabilityRequest';
import { getCurrentUser } from '@/lib/auth';
import { startOfDay } from 'date-fns';

// GET - Check which operators are unavailable for a specific date
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can check availability
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const date = new Date(dateStr);
    const dateStart = startOfDay(date);

    // Find all approved unavailability requests that include this date
    const requests = await UnavailabilityRequest.find({
      status: 'approved',
      dates: {
        $elemMatch: {
          $gte: dateStart,
          $lt: new Date(dateStart.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
    }).populate('operator', '_id name email').lean();

    // Extract operator IDs
    const unavailableOperatorIds = requests.map((req: any) => 
      typeof req.operator === 'object' ? req.operator._id.toString() : req.operator.toString()
    );

    return NextResponse.json({ unavailableOperatorIds });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: error.message || 'Failed to check availability' }, { status: 500 });
  }
}

