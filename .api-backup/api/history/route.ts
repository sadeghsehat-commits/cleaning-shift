import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const apartmentId = searchParams.get('apartmentId');
    const cleanerId = searchParams.get('cleanerId');

    let query: any = {
      status: 'completed',
    };

    // Operators can only see their own history
    if (user.role === 'operator') {
      query.cleaner = user._id;
    } else if (cleanerId) {
      query.cleaner = cleanerId;
    }

    // Owners can only see their apartments' history
    if (user.role === 'owner') {
      const Apartment = (await import('@/models/Apartment')).default;
      const apartments = await Apartment.find({ owner: user._id }).select('_id').lean();
      query.apartment = { $in: apartments.map((a) => a._id) };
    } else if (apartmentId) {
      query.apartment = apartmentId;
    }

    if (startDate) {
      query.actualEndTime = { ...query.actualEndTime, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.actualEndTime = { ...query.actualEndTime, $lte: new Date(endDate) };
    }

    const shifts = await CleaningShift.find(query)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone')
      .lean()
      .sort({ actualEndTime: -1 })
      .limit(100);

    return NextResponse.json({ shifts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
  }
}

