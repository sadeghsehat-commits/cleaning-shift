import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    void Apartment;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id);
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    if (user.role === 'operator') {
      const cleanerId = shift.cleaner.toString();
      const userId = user._id.toString();
      if (cleanerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only comment on your own shifts' }, { status: 403 });
      }
    } else if (user.role === 'owner') {
      const apartment = await Apartment.findById(shift.apartment);
      if (!apartment || apartment.owner.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: You can only comment on shifts for your apartments' }, { status: 403 });
      }
    }

    const { text } = await request.json();
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    if (!shift.comments) shift.comments = [];
    shift.comments.push({
      text: String(text).trim(),
      postedBy: user._id,
      postedAt: new Date(),
    });
    await shift.save();
    await shift.populate('comments.postedBy', 'name email');

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}
