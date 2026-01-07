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

    // If admin or owner added a comment, notify the operator
    if (user.role === 'admin' || user.role === 'owner') {
      const populatedShift = await CleaningShift.findById(id)
        .populate('apartment', 'name')
        .populate('cleaner', 'name email');
      
      const cleaner = (populatedShift as any)?.cleaner;
      if (cleaner) {
        const cleanerId = cleaner._id ? cleaner._id.toString() : cleaner.toString();
        const apartment = (populatedShift as any)?.apartment;
        const apartmentName = apartment?.name || 'the apartment';
        
        try {
          const notification = await Notification.create({
            user: cleanerId,
            type: 'shift_assigned', // Using existing type, or could create new 'comment_added' type
            title: 'New Comment Added',
            message: `${user.name || 'Admin/Owner'} added a comment for shift at ${apartmentName}`,
            relatedShift: shift._id,
          });

          // Send FCM push notification
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait for DB commit
          
          await sendFCMNotification(
            cleanerId,
            'New Comment Added',
            `${user.name || 'Admin/Owner'} added a comment for shift at ${apartmentName}`,
            {
              type: 'comment_added',
              notificationId: notification._id.toString(),
              shiftId: shift._id.toString(),
            }
          );
        } catch (notifError) {
          console.error('Error sending comment notification:', notifError);
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

