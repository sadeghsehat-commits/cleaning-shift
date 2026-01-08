import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment'; // Static import
import { getCurrentUser } from '@/lib/auth';

// Ensure Apartment model is registered
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

    // Only admins can delete comments
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

    // Find and remove the comment
    const commentIndex = shift.comments.findIndex(
      (comment: any) => comment._id?.toString() === commentId || comment._id === commentId
    );

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    shift.comments.splice(commentIndex, 1);
    await shift.save();

    // Populate comments for the response
    await shift.populate('comments.postedBy', 'name email');

    return NextResponse.json({ shift });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 });
  }
}


