import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

void Apartment;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can delete comments' }, { status: 403 });
    }

    const { id, commentId } = await params;
    const shift = await CleaningShift.findById(id);
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }
    if (!shift.comments || !Array.isArray(shift.comments)) {
      return NextResponse.json({ error: 'No comments found' }, { status: 404 });
    }

    const idx = shift.comments.findIndex(
      (c: any) => c._id?.toString() === commentId || c._id === commentId
    );
    if (idx === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    shift.comments.splice(idx, 1);
    await shift.save();
    await shift.populate('comments.postedBy', 'name email');

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}
