import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { sendFCMNotification } from '@/lib/fcm-notifications';

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

    // Check permissions - all users can comment on shifts they can see
    // Operators can comment on their own shifts
    if (user.role === 'operator') {
      const cleanerId = shift.cleaner.toString();
      const userId = user._id.toString();
      if (cleanerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only comment on your own shifts' }, { status: 403 });
      }
    } else if (user.role === 'owner') {
      // Owners can comment on shifts for their apartments
      const apartment = await Apartment.findById(shift.apartment);
      if (!apartment || apartment.owner.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: You can only comment on shifts for your apartments' }, { status: 403 });
      }
    }
    // Admin can comment on any shift

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
    }

    const commentText = text.trim();
    // Truncate comment text for notification (max 100 chars for mobile)
    const truncatedComment = commentText.length > 100 ? commentText.substring(0, 100) + '...' : commentText;

    if (!shift.comments) {
      shift.comments = [];
    }

    shift.comments.push({
      text: commentText,
      postedBy: user._id,
      postedAt: new Date(),
    });

    await shift.save();

    // Populate the comment's postedBy field for the response
    await shift.populate('comments.postedBy', 'name email');

    // Send notifications based on who added the comment
    if (user.role === 'admin' || user.role === 'owner') {
      // If admin or owner added a comment, notify the operator
      const populatedShift = await CleaningShift.findById(id)
        .populate('apartment', 'name')
        .populate('cleaner', 'name email');
      
      const cleaner = (populatedShift as any)?.cleaner;
      if (cleaner) {
        const cleanerId = cleaner._id ? cleaner._id.toString() : cleaner.toString();
        const apartment = (populatedShift as any)?.apartment;
        const apartmentName = apartment?.name || 'the apartment';
        const userName = user.name || 'Admin/Owner';
        
        try {
          const notification = await Notification.create({
            user: cleanerId,
            type: 'shift_assigned',
            title: 'TOP UP - Comment Added',
            message: `${userName}: ${truncatedComment}`,
            relatedShift: shift._id,
          });

          // Send FCM push notification with comment text
          const { sendFCMNotification } = await import('@/lib/fcm-notifications');
          await sendFCMNotification(
            cleanerId,
            'TOP UP - New Comment',
            `${userName}: ${truncatedComment}`,
            {
              shiftId: shift._id.toString(),
              url: `/dashboard/shifts/details?id=${shift._id}`,
              type: 'shift_assigned',
            }
          );
        } catch (notifError) {
          console.error('Error sending comment notification:', notifError);
          // Don't fail the request if notification fails
        }
      }
    } else if (user.role === 'operator') {
      // If operator added a comment, notify the owner
      const populatedShift = await CleaningShift.findById(id)
        .populate('apartment', 'name owner')
        .populate('cleaner', 'name email');
      
      const apartment = (populatedShift as any)?.apartment;
      if (apartment && apartment.owner) {
        const ownerId = apartment.owner._id ? apartment.owner._id.toString() : apartment.owner.toString();
        const operatorName = user.name || 'Operator';
        
        try {
          const notification = await Notification.create({
            user: ownerId,
            type: 'shift_assigned',
            title: 'TOP UP - Comment Added',
            message: `${operatorName}: ${truncatedComment}`,
            relatedShift: shift._id,
          });

          // Send FCM push notification with comment text
          const { sendFCMNotification } = await import('@/lib/fcm-notifications');
          await sendFCMNotification(
            ownerId,
            'TOP UP - New Comment',
            `${operatorName}: ${truncatedComment}`,
            {
              shiftId: shift._id.toString(),
              url: `/dashboard/shifts/details?id=${shift._id}`,
              type: 'shift_assigned',
            }
          );
        } catch (notifError) {
          console.error('Error sending comment notification to owner:', notifError);
          // Don't fail the request if notification fails
        }
      }
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}

