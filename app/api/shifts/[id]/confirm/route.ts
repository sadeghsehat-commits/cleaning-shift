import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'name owner')
      .populate('cleaner', 'name email');

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    let cleanerId: string;
    if (shift.cleaner && typeof shift.cleaner === 'object' && '_id' in (shift.cleaner as object)) {
      cleanerId = (shift.cleaner as { _id: { toString: () => string } })._id.toString();
    } else if (shift.cleaner) {
      cleanerId = typeof shift.cleaner === 'string'
        ? shift.cleaner
        : String(shift.cleaner);
    } else {
      return NextResponse.json({ error: 'Shift has no cleaner assigned' }, { status: 400 });
    }

    const userId = String(user._id);
    if (cleanerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only confirm your own shifts' },
        { status: 403 }
      );
    }

    shift.confirmedSeen = {
      confirmed: true,
      confirmedAt: new Date(),
    };
    await shift.save();

    const updatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    return NextResponse.json({ shift: updatedShift });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to confirm shift';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
