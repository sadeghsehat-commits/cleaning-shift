import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Operators, admins, and owners can request time changes
    if (!['operator', 'admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'owner')
      .populate('cleaner', 'name email');
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    const { newStartTime, newEndTime, newApartment, newCleaner, newScheduledDate, reason } = await request.json();

    // At least one field must be changed
    if (!newStartTime && !newEndTime && !newApartment && !newCleaner && !newScheduledDate) {
      return NextResponse.json({ error: 'At least one field must be changed' }, { status: 400 });
    }

    // Validation: Requests can only be sent until 1 hour before shift starts (for admin/owner requests)
    const isAdminOrOwnerRequest = ['admin', 'owner'].includes(user.role);
    if (isAdminOrOwnerRequest) {
      const scheduledDate = new Date(shift.scheduledDate);
      const scheduledStartTime = new Date(shift.scheduledStartTime);
      const scheduledDateTime = new Date(
        scheduledDate.getFullYear(),
        scheduledDate.getMonth(),
        scheduledDate.getDate(),
        scheduledStartTime.getHours(),
        scheduledStartTime.getMinutes(),
        scheduledStartTime.getSeconds(),
        0
      );
      
      const now = new Date();
      const oneHourBeforeShift = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000); // 1 hour before
      
      if (now >= oneHourBeforeShift) {
        return NextResponse.json({ 
          error: 'Time change requests can only be sent until 1 hour before the shift starts' 
        }, { status: 400 });
      }
    }

    const isOperatorRequest = user.role === 'operator';

    // Get cleaner from populated shift
    const apartment = shift.apartment as any;
    const cleaner = shift.cleaner as any;

    // If owner is changing the operator and the shift was already confirmed, reset confirmation
    // The new operator will need to confirm the shift
    if (newCleaner && shift.confirmedSeen?.confirmed) {
      const currentCleanerId = cleaner && typeof cleaner === 'object' && cleaner._id
        ? cleaner._id.toString()
        : (cleaner ? String(cleaner) : '');
      const newCleanerObj = newCleaner as any;
      const newCleanerId = typeof newCleanerObj === 'object' && newCleanerObj._id
        ? newCleanerObj._id.toString()
        : String(newCleanerObj);
      
      // Only reset if actually changing to a different operator
      if (currentCleanerId && newCleanerId && currentCleanerId !== newCleanerId) {
        shift.confirmedSeen = {
          confirmed: false,
          confirmedAt: undefined,
        };
      }
    }

    shift.timeChangeRequest = {
      requestedBy: user._id,
      newStartTime: newStartTime ? new Date(newStartTime) : undefined,
      newEndTime: newEndTime ? new Date(newEndTime) : undefined,
      newApartment: newApartment ? newApartment : undefined,
      newCleaner: newCleaner ? newCleaner : undefined,
      newScheduledDate: newScheduledDate ? new Date(newScheduledDate) : undefined,
      reason,
      status: isAdminOrOwnerRequest ? 'pending' : 'pending', // Will need operator confirmation if admin/owner requests
      operatorConfirmed: false,
    };

    await shift.save();

    const apartmentName = apartment?.name || 'the apartment';
    const requesterName = user.name || 'Someone';

    if (isOperatorRequest) {
      // Operator requesting - notify owner and admin
      if (apartment?.owner) {
        await Notification.create({
          user: apartment.owner,
          type: 'time_change_request',
          title: 'Time Change Request',
          message: `Operator ${requesterName} has requested a time change for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }

      // Notify admin
      const User = (await import('@/models/User')).default;
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'time_change_request',
          title: 'Time Change Request',
          message: `Operator ${requesterName} has requested a time change for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }
    } else if (isAdminOrOwnerRequest) {
      // Admin/Owner requesting - notify operator
      // Determine which cleaner to notify (new cleaner if changed, otherwise current cleaner)
      const cleanerToNotify = newCleaner || cleaner;
      if (cleanerToNotify) {
        const cleanerId = cleanerToNotify._id ? cleanerToNotify._id.toString() : cleanerToNotify.toString();
        const changes = [];
        if (newStartTime || newEndTime) changes.push('time');
        if (newApartment) changes.push('apartment');
        if (newCleaner) changes.push('operator');
        if (newScheduledDate) changes.push('date');
        const changesText = changes.join(', ');
        
        await Notification.create({
          user: cleanerId,
          type: 'time_change_requested_by_admin',
          title: 'Shift Edit Requested',
          message: `${requesterName} has requested to change the ${changesText} for ${apartmentName}. Please confirm.`,
          relatedShift: shift._id,
        });
      }
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to request time change' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owners can approve/reject operator time change requests
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Only owners can approve/reject time change requests' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'owner')
      .populate('cleaner');
    if (!shift || !shift.timeChangeRequest) {
      return NextResponse.json({ error: 'Time change request not found' }, { status: 404 });
    }

    const { status: newStatus } = await request.json();

    if (!['approved', 'rejected'].includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    shift.timeChangeRequest.status = newStatus;
    shift.timeChangeRequest.reviewedBy = user._id;
    shift.timeChangeRequest.reviewedAt = new Date();

    if (newStatus === 'approved' && shift.timeChangeRequest.newStartTime) {
      shift.scheduledStartTime = shift.timeChangeRequest.newStartTime;
      if (shift.timeChangeRequest.newEndTime) {
        shift.scheduledEndTime = shift.timeChangeRequest.newEndTime;
      }
    }

    await shift.save();

    // Notify operator and cleaner
    const cleaner = shift.cleaner as any;
    if (cleaner) {
      await Notification.create({
        user: cleaner._id,
        type: newStatus === 'approved' ? 'time_change_approved' : 'time_change_rejected',
        title: `Time Change ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your time change request has been ${newStatus}.`,
        relatedShift: shift._id,
      });
    }

    const User = (await import('@/models/User')).default;
    const operators = await User.find({ role: 'operator' });
    for (const operator of operators) {
      await Notification.create({
        user: operator._id,
        type: newStatus === 'approved' ? 'time_change_approved' : 'time_change_rejected',
        title: `Time Change ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your time change request has been ${newStatus}.`,
        relatedShift: shift._id,
      });
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update time change request' }, { status: 500 });
  }
}

