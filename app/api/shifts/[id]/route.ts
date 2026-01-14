import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { sendFCMNotification } from '@/lib/fcm-notifications';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    // Ensure Apartment model is registered (import ensures registration)
    void Apartment;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate({
        path: 'apartment',
        select: 'name address owner',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      })
      .populate('cleaner', 'name email phone')
      .populate('createdBy', 'name')
      .populate('comments.postedBy', 'name email')
      .lean();

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Operators can only see their own shifts
    if (user.role === 'operator') {
      // Handle both populated object and ObjectId
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
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Owners can only see shifts for their own apartments
    if (user.role === 'owner') {
      const apartment = shift.apartment as any;
      if (apartment.owner && apartment.owner.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Ensure comments are sorted newest first before returning
    if (shift.comments && Array.isArray(shift.comments)) {
      shift.comments.sort((a: any, b: any) => {
        const aTime = a?.postedAt ? new Date(a.postedAt).getTime() : 0;
        const bTime = b?.postedAt ? new Date(b.postedAt).getTime() : 0;
        return bTime - aTime; // newest first
      });
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch shift' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json();
    const { 
      actualStartTime, 
      actualEndTime, 
      status, 
      notes,
      apartment,
      cleaner,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      guestCount
    } = body;

    // Owners can only edit guest count (up to 24 hours before shift)
    if (user.role === 'owner') {
      // Check if shift belongs to owner's apartment
      const shiftWithApartment = await CleaningShift.findById(id)
        .populate('apartment', 'owner');
      
      if (!shiftWithApartment) {
        return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
      }

      const apartment = shiftWithApartment.apartment as any;
      const ownerId = apartment.owner && typeof apartment.owner === 'object' 
        ? apartment.owner._id.toString() 
        : apartment.owner.toString();
      const userId = user._id.toString();

      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only edit shifts for your own apartments' }, { status: 403 });
      }

      // Calculate time until shift starts
      const scheduledDateObj = new Date(shift.scheduledDate);
      const scheduledStartTimeObj = new Date(shift.scheduledStartTime);
      const scheduledDateTime = new Date(
        scheduledDateObj.getFullYear(),
        scheduledDateObj.getMonth(),
        scheduledDateObj.getDate(),
        scheduledStartTimeObj.getHours(),
        scheduledStartTimeObj.getMinutes(),
        0,
        0
      );
      const now = new Date();
      const hoursUntilShift = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Owners can edit guest count until the shift starts (not 24 hours before)
      if (hoursUntilShift <= 0) {
        return NextResponse.json({ 
          error: 'Cannot edit shift. The shift has already started.' 
        }, { status: 400 });
      }

      // Owners can only edit guest count
      // Block all other modifications
      if (scheduledDate || scheduledStartTime || scheduledEndTime || apartment || cleaner) {
        return NextResponse.json({ 
          error: 'Forbidden: Owners can only edit guest count. Date, time, operator, and apartment cannot be changed.' 
        }, { status: 403 });
      }

      // Update guest count if provided
      if (guestCount !== undefined && guestCount !== null) {
        shift.guestCount = guestCount;
      }

      // Update notes if provided
      if (notes !== undefined) {
        shift.notes = notes;
      }

      await shift.save();
      
      // Notify operator when owner edits guest count
      if (guestCount !== undefined && guestCount !== null) {
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
              type: 'shift_time_changed', // Reusing type for shift updates
              title: 'Guest Count Updated',
              message: `Guest count for ${apartmentName} has been updated to ${guestCount}`,
              relatedShift: shift._id,
            });

            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for DB commit
            
            await sendFCMNotification(
              cleanerId,
              'Guest Count Updated',
              `Guest count for ${apartmentName} has been updated to ${guestCount}`,
              {
                type: 'guest_count_updated',
                notificationId: notification._id.toString(),
                shiftId: shift._id.toString(),
              }
            );
          } catch (notifError) {
            console.error('Error sending guest count notification:', notifError);
            // Don't fail the request if notification fails
          }
        }
      }
      
      return NextResponse.json({ shift });
    } 
    // Operators can update their own shift status and times
    else if (user.role === 'operator') {
      // Handle cleaner ID comparison
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
      
      if (cleanerId === userId) {
        // Validation: Cannot start before scheduled time
        if (actualStartTime) {
          // Check if operator already has an active shift (started but not completed)
          const activeShift = await CleaningShift.findOne({
            _id: { $ne: shift._id }, // Exclude current shift
            cleaner: userId,
            actualStartTime: { $exists: true, $ne: null }, // Has start time
            actualEndTime: { $exists: false } // But no end time (still in progress)
          });

          if (activeShift) {
            return NextResponse.json({ 
              error: 'You cannot start a new cleaning shift while another shift is already in progress. Please complete the current shift first.' 
            }, { status: 400 });
          }

          const startTime = new Date(actualStartTime);
          // Combine scheduled date and start time to get the full scheduled datetime
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
          
          if (startTime < scheduledDateTime) {
            return NextResponse.json({ 
              error: 'Cannot start shift before the scheduled time' 
            }, { status: 400 });
          }
          shift.actualStartTime = startTime;
        }
        
        // Validation: Cannot complete in less than 1 hour
        if (actualEndTime) {
          const endTime = new Date(actualEndTime);
          
          if (!shift.actualStartTime) {
            return NextResponse.json({ 
              error: 'Cannot complete shift without starting it first' 
            }, { status: 400 });
          }
          
          const startTime = new Date(shift.actualStartTime);
          const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
          const timeDifference = endTime.getTime() - startTime.getTime();
          
          if (timeDifference < oneHourInMs) {
            return NextResponse.json({ 
              error: 'Cannot mark shift as completed in less than 1 hour. Minimum duration is 1 hour.' 
            }, { status: 400 });
          }
          
          shift.actualEndTime = endTime;
        }
        
        if (status) shift.status = status;
        if (notes) shift.notes = notes;
        
        // Save the shift after updating
        await shift.save();
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === 'admin') {
      // Admins can manage shifts
      // Store old cleaner ObjectId before updating (for operator change detection)
      const oldCleaner = shift.cleaner;
      const oldCleanerId = oldCleaner ? oldCleaner.toString() : null;
      
      // Calculate time until shift starts (using original scheduled time)
      const currentScheduledDateTime = new Date(shift.scheduledDate);
      const currentScheduledStartTime = new Date(shift.scheduledStartTime);
      const currentScheduledFullDateTime = new Date(
        currentScheduledDateTime.getFullYear(),
        currentScheduledDateTime.getMonth(),
        currentScheduledDateTime.getDate(),
        currentScheduledStartTime.getHours(),
        currentScheduledStartTime.getMinutes(),
        0,
        0
      );
      const now = new Date();
      const hoursUntilShift = (currentScheduledFullDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      const canEditDateTimeDirectly = hoursUntilShift >= 18; // 18 hours before shift
      const canEditOperatorDirectly = hoursUntilShift >= 10; // 10 hours before shift
      
      // Check if operator was changed
      const newCleanerId = cleaner ? cleaner.toString() : null;
      const operatorChanged = oldCleanerId && newCleanerId && oldCleanerId !== newCleanerId;
      
      // Check if date/time was changed
      const dateTimeChanged = apartment || scheduledDate || scheduledStartTime || scheduledEndTime;
      
      // Validate time restrictions
      if (dateTimeChanged && !canEditDateTimeDirectly) {
        return NextResponse.json({ 
          error: 'Cannot edit date/time directly. Less than 18 hours remaining before shift starts. Please use the request system.' 
        }, { status: 400 });
      }
      
      if (operatorChanged && !canEditOperatorDirectly && !dateTimeChanged) {
        return NextResponse.json({ 
          error: 'Cannot change operator directly. Less than 10 hours remaining before shift starts. Please use the request system.' 
        }, { status: 400 });
      }
      
      // Validate operator change (check if new operator already has 3 shifts on this date)
      if (operatorChanged) {
        const shiftDate = scheduledDate ? new Date(scheduledDate) : new Date(shift.scheduledDate);
        const dateOnly = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
        const nextDay = new Date(dateOnly);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const existingOperatorShifts = await CleaningShift.find({
          _id: { $ne: shift._id },
          cleaner: newCleanerId,
          scheduledDate: { $gte: dateOnly, $lt: nextDay },
          status: { $ne: 'cancelled' },
        });

        if (existingOperatorShifts.length >= 3) {
          return NextResponse.json({ 
            error: 'This operator already has 3 shifts scheduled for this date. An operator can have a maximum of 3 shifts per day.' 
          }, { status: 400 });
        }
      }
      
      // Apply changes
      if (apartment) shift.apartment = apartment;
      if (cleaner) shift.cleaner = cleaner;
      if (scheduledDate) {
        const newDate = new Date(scheduledDate);
        shift.scheduledDate = newDate;
      }
      if (scheduledStartTime) {
        const newStartTime = new Date(scheduledStartTime);
        const shiftDate = scheduledDate ? new Date(scheduledDate) : new Date(shift.scheduledDate);
        shift.scheduledStartTime = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          newStartTime.getHours(),
          newStartTime.getMinutes(),
          0,
          0
        );
      }
      if (scheduledEndTime !== undefined) {
        if (scheduledEndTime === null || scheduledEndTime === '') {
          shift.scheduledEndTime = undefined;
        } else {
          const newEndTime = new Date(scheduledEndTime);
          const shiftDate = scheduledDate ? new Date(scheduledDate) : new Date(shift.scheduledDate);
          shift.scheduledEndTime = new Date(
            shiftDate.getFullYear(),
            shiftDate.getMonth(),
            shiftDate.getDate(),
            newEndTime.getHours(),
            newEndTime.getMinutes(),
            0,
            0
          );
          
          // Validate end time is after start time
          if (shift.scheduledEndTime <= shift.scheduledStartTime) {
            return NextResponse.json({ 
              error: 'End time must be after start time' 
            }, { status: 400 });
          }
        }
      }
      if (actualStartTime) shift.actualStartTime = new Date(actualStartTime);
      if (actualEndTime) shift.actualEndTime = new Date(actualEndTime);
      if (notes !== undefined) shift.notes = notes;
      
      await shift.save();
      
      // Populate shift for notifications
      const populatedShift = await CleaningShift.findById(shift._id)
        .populate('apartment', 'name')
        .populate('cleaner', 'name email');
      
      const shiftApartment = (populatedShift as any).apartment;
      const apartmentName = shiftApartment?.name || 'the apartment';
      
      // Check if time was changed and notify operator
      const oldStartTime = shift.scheduledStartTime ? new Date(shift.scheduledStartTime).getTime() : null;
      const newStartTime = scheduledStartTime ? new Date(scheduledStartTime).getTime() : null;
      const timeChanged = scheduledStartTime && oldStartTime && newStartTime !== oldStartTime;
      
      // If operator was changed, notify both old and new operators
      if (operatorChanged) {
        // Notify old operator that shift was removed
        if (oldCleanerId) {
          const notification1 = await Notification.create({
            user: oldCleanerId,
            type: 'shift_assigned',
            title: 'Shift Reassigned',
            message: `The shift at ${apartmentName} has been reassigned to another operator.`,
            relatedShift: shift._id,
          });

          await new Promise(resolve => setTimeout(resolve, 100));
          await sendFCMNotification(
            oldCleanerId,
            'Shift Reassigned',
            `The shift at ${apartmentName} has been reassigned to another operator.`,
            {
              type: 'shift_reassigned',
              notificationId: notification1._id.toString(),
              shiftId: shift._id.toString(),
            }
          ).catch(err => console.error('FCM error for old operator:', err));
        }
        
        // Notify new operator that shift was assigned
        const newCleaner = (populatedShift as any).cleaner;
        if (newCleaner) {
          const newCleanerId = newCleaner._id ? newCleaner._id.toString() : newCleaner.toString();
          const notification2 = await Notification.create({
            user: newCleanerId,
            type: 'shift_assigned',
            title: 'New Shift Assigned',
            message: `You have been assigned a new shift at ${apartmentName}.`,
            relatedShift: shift._id,
          });

          await new Promise(resolve => setTimeout(resolve, 100));
          await sendFCMNotification(
            newCleanerId,
            'New Shift Assigned',
            `You have been assigned a new shift at ${apartmentName}.`,
            {
              type: 'shift_assigned',
              notificationId: notification2._id.toString(),
              shiftId: shift._id.toString(),
            }
          ).catch(err => console.error('FCM error for new operator:', err));
        }
      } else if (timeChanged || dateTimeChanged) {
        // Notify the operator if time or date was changed (but operator didn't change)
        const cleaner = (populatedShift as any).cleaner;
        if (cleaner) {
          const cleanerId = cleaner._id ? cleaner._id.toString() : cleaner.toString();
          const notification = await Notification.create({
            user: cleanerId,
            type: 'shift_time_changed',
            title: 'Shift Time Changed',
            message: `The scheduled time for ${apartmentName} has been changed by admin. Please check the new time.`,
            relatedShift: shift._id,
          });

          await new Promise(resolve => setTimeout(resolve, 100));
          await sendFCMNotification(
            cleanerId,
            'Shift Time Changed',
            `The scheduled time for ${apartmentName} has been changed by admin. Please check the new time.`,
            {
              type: 'shift_time_changed',
              notificationId: notification._id.toString(),
              shiftId: shift._id.toString(),
            }
          ).catch(err => console.error('FCM error for time change:', err));
        }
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    return NextResponse.json({ shift: updatedShift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Get shift details before deleting to send notification
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'name owner')
      .populate('cleaner', 'name email');
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'admin') {
      // Admins can delete any shift
    } else if (user.role === 'operator') {
      // Operators can delete shifts (existing behavior)
    } else if (user.role === 'owner') {
      // Owners can only delete shifts they created
      const createdByObj = shift.createdBy as any;
      const createdById = createdByObj && typeof createdByObj === 'object' && createdByObj._id
        ? createdByObj._id.toString()
        : (createdByObj ? String(createdByObj) : null);
      const userId = user._id.toString();

      if (!createdById || createdById !== userId) {
        return NextResponse.json({ 
          error: 'Forbidden: You can only delete shifts that you created' 
        }, { status: 403 });
      }

      // Also verify the apartment belongs to the owner
      const apartment = shift.apartment as any;
      const ownerId = apartment.owner && typeof apartment.owner === 'object'
        ? apartment.owner._id.toString()
        : apartment.owner.toString();

      if (ownerId !== userId) {
        return NextResponse.json({ 
          error: 'Forbidden: You can only delete shifts for your own apartments' 
        }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Notify the operator if shift is being deleted
    const cleaner = shift.cleaner as any;
    if (cleaner) {
      const cleanerId = cleaner._id ? cleaner._id.toString() : cleaner.toString();
      const apartment = shift.apartment as any;
      const apartmentName = apartment?.name || 'the apartment';
      
      await Notification.create({
        user: cleanerId,
        type: 'shift_deleted',
        title: 'Shift Deleted',
        message: `The shift for ${apartmentName} has been deleted.`,
        relatedShift: shift._id,
      });
    }

    // Delete the shift
    await CleaningShift.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete shift' }, { status: 500 });
  }
}

