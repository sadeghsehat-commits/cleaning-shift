import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await Notification.find({ user: user._id })
      .lean()
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Collect all shift IDs that need details
    const shiftIds: string[] = [];
    notifications.forEach((notif) => {
      if (notif.relatedShift && (notif.type === 'shift_assigned' || notif.type === 'time_change_requested_by_admin' || notif.type === 'problem_reported' || notif.type === 'shift_time_changed' || notif.type === 'instruction_photo_added' || notif.type === 'shift_deleted')) {
        const shiftId = typeof notif.relatedShift === 'object' && (notif.relatedShift as any)._id
          ? (notif.relatedShift as any)._id.toString()
          : notif.relatedShift.toString();
        if (shiftId) shiftIds.push(shiftId);
      }
    });
    
    // Fetch all shift details in one query
    const CleaningShift = (await import('@/models/CleaningShift')).default;
    const shiftsMap = new Map();
    if (shiftIds.length > 0) {
      const shifts = await CleaningShift.find({ _id: { $in: shiftIds } })
        .populate('apartment', 'name address')
        .lean();
      
      shifts.forEach((shift: any) => {
        shiftsMap.set(shift._id.toString(), shift);
      });
    }
    
    // Map notifications with shift details
    const notificationsWithDetails = notifications.map((notif) => {
      const notifObj: any = { ...notif };
      
      // Ensure relatedShift is always a string ID
      const shiftId = notif.relatedShift 
        ? (typeof notif.relatedShift === 'object' && (notif.relatedShift as any)._id 
            ? (notif.relatedShift as any)._id.toString() 
            : notif.relatedShift.toString())
        : null;
      
      notifObj.relatedShift = shiftId;
      
      // Add shift details if available
      if (shiftId && shiftsMap.has(shiftId)) {
        const shift = shiftsMap.get(shiftId);
        notifObj.shiftDetails = {
          apartmentName: (shift.apartment as any)?.name || 'Unknown Apartment',
          apartmentAddress: (shift.apartment as any)?.address || '',
          scheduledDate: shift.scheduledDate,
          scheduledStartTime: shift.scheduledStartTime,
          scheduledEndTime: shift.scheduledEndTime,
          confirmed: shift.confirmedSeen?.confirmed || false,
        };
        
        // Add time change request details if it's a time change notification
        if (notif.type === 'time_change_requested_by_admin' && shift.timeChangeRequest) {
          notifObj.timeChangeDetails = {
            newStartTime: shift.timeChangeRequest.newStartTime,
            newEndTime: shift.timeChangeRequest.newEndTime,
            reason: shift.timeChangeRequest.reason,
            operatorConfirmed: shift.timeChangeRequest.operatorConfirmed || false,
          };
        }
      }
      
      return notifObj;
    });

    return NextResponse.json({ notifications: notificationsWithDetails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, read } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    // If marking as read, set readAt timestamp. If marking as unread, clear readAt.
    const updateData: any = { read };
    if (read) {
      updateData.readAt = new Date();
    } else {
      updateData.readAt = null;
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: user._id },
      updateData
    );

    return NextResponse.json({ message: 'Notifications updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}

