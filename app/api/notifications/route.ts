import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import CleaningShift from '@/models/CleaningShift';
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

    const shiftIds: string[] = [];
    notifications.forEach((notif: any) => {
      if (notif.relatedShift && (notif.type === 'shift_assigned' || notif.type === 'time_change_requested_by_admin')) {
        const shiftId = typeof notif.relatedShift === 'object' && notif.relatedShift?._id
          ? notif.relatedShift._id.toString()
          : String(notif.relatedShift);
        if (shiftId) shiftIds.push(shiftId);
      }
    });

    const shiftsMap = new Map<string, any>();
    if (shiftIds.length > 0) {
      const shifts = await CleaningShift.find({ _id: { $in: shiftIds } })
        .populate('apartment', 'name address')
        .lean();
      shifts.forEach((s: any) => shiftsMap.set(s._id.toString(), s));
    }

    const notificationsWithDetails = notifications.map((notif: any) => {
      const out = { ...notif };
      const shiftId = notif.relatedShift
        ? (typeof notif.relatedShift === 'object' && notif.relatedShift?._id ? notif.relatedShift._id.toString() : String(notif.relatedShift))
        : null;
      out.relatedShift = shiftId;
      if (shiftId && shiftsMap.has(shiftId)) {
        const s = shiftsMap.get(shiftId);
        out.shiftDetails = {
          apartmentName: s?.apartment?.name || 'Unknown',
          apartmentAddress: s?.apartment?.address || '',
          scheduledDate: s?.scheduledDate,
          scheduledStartTime: s?.scheduledStartTime,
          scheduledEndTime: s?.scheduledEndTime,
          confirmed: s?.confirmedSeen?.confirmed || false,
        };
        if (notif.type === 'time_change_requested_by_admin' && s?.timeChangeRequest) {
          const t = s.timeChangeRequest;
          out.timeChangeDetails = {
            newStartTime: t.newStartTime,
            newEndTime: t.newEndTime,
            reason: t.reason,
            operatorConfirmed: !!t.operatorConfirmed,
          };
        }
      }
      return out;
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

    const body = await request.json().catch(() => ({}));
    const { notificationIds, read } = body as { notificationIds?: string[]; read?: boolean };

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    const update: Record<string, unknown> = { $set: { read: !!read } };
    if (read) {
      (update.$set as any).readAt = new Date();
    } else {
      (update.$set as any).readAt = null;
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, user: user._id },
      update
    );

    return NextResponse.json({ message: 'Notifications updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
