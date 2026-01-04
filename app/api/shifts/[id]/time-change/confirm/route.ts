import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only operators can confirm time changes
    if (user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'owner name')
      .populate('cleaner', 'name email');
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    if (!shift.timeChangeRequest) {
      return NextResponse.json({ error: 'No time change request found' }, { status: 404 });
    }

    // Check if operator is the cleaner for this shift
    let cleanerId: string;
    if (shift.cleaner && typeof shift.cleaner === 'object' && '_id' in shift.cleaner) {
      cleanerId = (shift.cleaner as any)._id.toString();
    } else if (shift.cleaner) {
      cleanerId = typeof shift.cleaner === 'string' 
        ? shift.cleaner 
        : (shift.cleaner as any).toString();
    } else {
      return NextResponse.json({ error: 'Shift has no cleaner assigned' }, { status: 400 });
    }
    const userId = user._id.toString();
    
    if (cleanerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You can only confirm time changes for your own shifts' }, { status: 403 });
    }

    const { confirmed } = await request.json();

    if (typeof confirmed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid confirmation value' }, { status: 400 });
    }

    if (confirmed) {
      // Operator confirmed - update all requested shift fields and notify admin/owner
      shift.timeChangeRequest.operatorConfirmed = true;
      shift.timeChangeRequest.operatorConfirmedAt = new Date();
      shift.timeChangeRequest.status = 'operator_confirmed';
      
      // Store old cleaner ID before updating (to check if operator changed)
      const oldCleanerId = cleanerId;
      
      // Update the shift fields
      if (shift.timeChangeRequest.newStartTime) {
        shift.scheduledStartTime = shift.timeChangeRequest.newStartTime;
      }
      if (shift.timeChangeRequest.newEndTime !== undefined) {
        if (shift.timeChangeRequest.newEndTime) {
          shift.scheduledEndTime = shift.timeChangeRequest.newEndTime;
        } else {
          shift.scheduledEndTime = undefined; // Clear end time if null
        }
      }
      if (shift.timeChangeRequest.newApartment) {
        shift.apartment = shift.timeChangeRequest.newApartment;
      }
      
      // If operator was changed, reset confirmation so new operator must confirm
      if (shift.timeChangeRequest.newCleaner) {
        const newCleanerObj = shift.timeChangeRequest.newCleaner as any;
        const newCleanerId = typeof newCleanerObj === 'object' && newCleanerObj._id
          ? newCleanerObj._id.toString()
          : String(newCleanerObj);
        
        // Only reset if actually changing to a different operator
        if (oldCleanerId !== newCleanerId) {
          shift.confirmedSeen = {
            confirmed: false,
            confirmedAt: undefined,
          };
        }
        shift.cleaner = shift.timeChangeRequest.newCleaner;
      }
      
      if (shift.timeChangeRequest.newScheduledDate) {
        shift.scheduledDate = shift.timeChangeRequest.newScheduledDate;
      }

      await shift.save();

      // Notify admin and owner
      const apartment = shift.apartment as any;
      const operator = shift.cleaner as any;
      const operatorName = operator?.name || user.name || 'Operator';
      const apartmentName = apartment?.name || 'the apartment';

      // Notify apartment owner
      if (apartment?.owner) {
        await Notification.create({
          user: apartment.owner,
          type: 'time_change_confirmed_by_operator',
          title: 'Time Change Confirmed by Operator',
          message: `${operatorName} has confirmed the time change for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }

      // Notify all admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'time_change_confirmed_by_operator',
          title: 'Time Change Confirmed by Operator',
          message: `${operatorName} has confirmed the time change for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }
    } else {
      // Operator rejected
      shift.timeChangeRequest.operatorConfirmed = false;
      shift.timeChangeRequest.status = 'operator_rejected';
      await shift.save();

      // Notify admin and owner
      const apartment = shift.apartment as any;
      const operator = shift.cleaner as any;
      const operatorName = operator?.name || user.name || 'Operator';
      const apartmentName = apartment?.name || 'the apartment';

      if (apartment?.owner) {
        await Notification.create({
          user: apartment.owner,
          type: 'time_change_rejected',
          title: 'Time Change Rejected by Operator',
          message: `${operatorName} has rejected the time change request for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'time_change_rejected',
          title: 'Time Change Rejected by Operator',
          message: `${operatorName} has rejected the time change request for ${apartmentName}.`,
          relatedShift: shift._id,
        });
      }
    }

    const updatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    return NextResponse.json({ shift: updatedShift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to confirm time change' }, { status: 500 });
  }
}

