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

    const { id } = await params;
    const shift = await CleaningShift.findById(id);
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'operator') {
      // Operators can only comment on their own shifts
      const cleanerId = shift.cleaner.toString();
      const userId = user._id.toString();
      if (cleanerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'owner') {
      // Owners can only comment on shifts for their apartments
      const Apartment = (await import('@/models/Apartment')).default;
      const apartment = await Apartment.findById(shift.apartment);
      if (!apartment || apartment.owner.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Admin can comment on any shift

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    if (!shift.comments) {
      shift.comments = [];
    }

    shift.comments.push({
      text: text.trim(),
      postedBy: user._id,
      postedAt: new Date(),
    });

    await shift.save();

    // Populate the comment's postedBy field for the response
    await shift.populate('comments.postedBy', 'name email');

    return NextResponse.json({ shift });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}

