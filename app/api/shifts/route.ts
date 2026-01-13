import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Ensure Apartment model is registered (import ensures registration)
    void Apartment;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const cleanerId = searchParams.get('cleanerId');
    const apartmentId = searchParams.get('apartmentId');

    let query: any = {};

    // Filter by apartment if provided (for admins and owners)
    if (apartmentId) {
      if (user.role === 'admin') {
        query.apartment = apartmentId;
      } else if (user.role === 'owner') {
        // Verify the apartment belongs to the owner
        const apartment = await Apartment.findById(apartmentId);
        if (apartment && apartment.owner.toString() === user._id.toString()) {
          query.apartment = apartmentId;
        } else {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Operators can only see their own shifts
    if (user.role === 'operator') {
      query.cleaner = user._id;
    } else if (cleanerId && user.role === 'admin') {
      query.cleaner = cleanerId;
    }

    // Owners can only see shifts for their own apartments (if apartmentId not already set)
    if (user.role === 'owner' && !apartmentId) {
      const apartments = await Apartment.find({ owner: user._id }).select('_id').lean();
      if (apartments.length === 0) {
        // Owner has no apartments, return empty shifts array
        return NextResponse.json({ shifts: [] });
      }
      query.apartment = { $in: apartments.map((a) => a._id) };
    }

    // Filter by month if provided
    if (month) {
      const monthDate = new Date(month);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      query.scheduledDate = { $gte: start, $lte: end };
    }

    // Filter by date range if provided (startDate and endDate)
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // If month filter is also present, combine them (intersection)
      if (month) {
        const monthDate = new Date(month);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        query.scheduledDate = { 
          $gte: start > monthStart ? start : monthStart, 
          $lte: end < monthEnd ? end : monthEnd 
        };
      } else {
        query.scheduledDate = { $gte: start, $lte: end };
      }
    } else if (startDate) {
      const start = new Date(startDate);
      if (month) {
        const monthDate = new Date(month);
        const monthStart = startOfMonth(monthDate);
        query.scheduledDate = { 
          $gte: start > monthStart ? start : monthStart, 
          $lte: endOfMonth(monthDate)
        };
      } else {
        query.scheduledDate = { $gte: start };
      }
    } else if (endDate) {
      const end = new Date(endDate);
      if (month) {
        const monthDate = new Date(month);
        const monthEnd = endOfMonth(monthDate);
        query.scheduledDate = { 
          $gte: startOfMonth(monthDate), 
          $lte: end < monthEnd ? end : monthEnd 
        };
      } else {
        query.scheduledDate = { $lte: end };
      }
    }

    // Filter by status if provided
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      query.status = statusFilter;
    }
    
    // For shifts page, exclude completed shifts and only show future shifts
    const excludeCompleted = searchParams.get('excludeCompleted') === 'true';
    if (excludeCompleted && !statusFilter) {
      // Only exclude completed if status filter is not set
      query.status = { $ne: 'completed' };
      // Only show shifts that haven't passed yet
      // We'll filter this in memory after fetching, as MongoDB date comparison is complex
      // The client-side will also do a final check
    }

    // For admin and owner users, include owner information in apartment
    const apartmentFields = (user.role === 'admin' || user.role === 'owner') ? 'name address owner' : 'name address';
    
    let shifts = await CleaningShift.find(query)
      .populate('apartment', apartmentFields)
      .populate('cleaner', 'name email phone')
      .populate('createdBy', 'name role')
      .sort({ scheduledDate: 1, scheduledStartTime: 1 });
    
    // If admin or owner, also populate apartment owner
    if (user.role === 'admin' || user.role === 'owner') {
      shifts = await CleaningShift.populate(shifts, {
        path: 'apartment.owner',
        select: 'name email'
      });
    }

    // Filter out shifts with null apartments (deleted apartments)
    shifts = shifts.filter((shift: any) => shift.apartment !== null && shift.apartment !== undefined);

    // Filter out past shifts if excludeCompleted is true (but not if showing completed)
    // Always include today's shifts and in_progress shifts
    if (excludeCompleted && statusFilter !== 'completed') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      shifts = shifts.filter((shift) => {
        // Always show in_progress shifts
        if (shift.status === 'in_progress') {
          return true;
        }
        
        // Always show shifts from today
        const shiftDate = new Date(shift.scheduledDate);
        const shiftDateOnly = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
        if (shiftDateOnly.getTime() === today.getTime()) {
          return true;
        }
        
        // For other days, only show future shifts
        const shiftTime = new Date(shift.scheduledStartTime);
        const shiftDateTime = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          shiftTime.getHours(),
          shiftTime.getMinutes(),
          0,
          0
        );
        return shiftDateTime >= now;
      });
    }

    // Custom sort: scheduled first, then in_progress, then others, all by date/time (oldest first)
    const sortedShifts = shifts.sort((a, b) => {
      // Status priority: scheduled > in_progress > cancelled
      const statusPriority: { [key: string]: number } = {
        'scheduled': 1,
        'in_progress': 2,
        'cancelled': 3,
        'completed': 4
      };
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same status, sort by date and time (oldest first)
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      const timeA = new Date(a.scheduledStartTime).getTime();
      const timeB = new Date(b.scheduledStartTime).getTime();
      return timeA - timeB;
    });

    return NextResponse.json({ shifts: sortedShifts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can create shifts
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only administrators can create shifts' }, { status: 403 });
    }

    const { apartment, cleaner, scheduledDate, scheduledStartTime, scheduledEndTime, notes, guestCount } = await request.json();

    if (!apartment || !cleaner || !scheduledDate || !scheduledStartTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validation 1: Check if apartment already has a shift on this date
    const shiftDate = new Date(scheduledDate);
    // Normalize to start of day for comparison
    const dateOnly = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Query shifts where scheduledDate falls within the same day
    const existingApartmentShift = await CleaningShift.findOne({
      apartment: apartment,
      scheduledDate: { $gte: dateOnly, $lt: nextDay },
      status: { $ne: 'cancelled' }, // Don't count cancelled shifts
    });

    if (existingApartmentShift) {
      return NextResponse.json({ 
        error: 'This apartment already has a shift scheduled for this date. Each apartment can only have one shift per day.' 
      }, { status: 400 });
    }

    // Validation 2: Check if operator already has 3 or more shifts on this date
    const existingOperatorShifts = await CleaningShift.find({
      cleaner: cleaner,
      scheduledDate: { $gte: dateOnly, $lt: nextDay },
      status: { $ne: 'cancelled' }, // Don't count cancelled shifts
    });

    if (existingOperatorShifts.length >= 3) {
      return NextResponse.json({ 
        error: 'This operator already has 3 shifts scheduled for this date. An operator can have a maximum of 3 shifts per day.' 
      }, { status: 400 });
    }

    // Validation 3: Check if operator has shifts that overlap or are too close (less than 90 minutes apart)
    const newStartTime = new Date(scheduledStartTime);
    const newEndTime = scheduledEndTime ? new Date(scheduledEndTime) : new Date(newStartTime.getTime() + 90 * 60 * 1000); // Default to 90 minutes if no end time
    
    // Normalize times to the selected date
    const newStartDateTime = new Date(dateOnly);
    newStartDateTime.setHours(newStartTime.getHours(), newStartTime.getMinutes(), 0, 0);
    const newEndDateTime = new Date(dateOnly);
    newEndDateTime.setHours(newEndTime.getHours(), newEndTime.getMinutes(), 0, 0);
    
    for (const existingShift of existingOperatorShifts) {
      const existingStartTime = new Date(existingShift.scheduledStartTime);
      const existingEndTime = existingShift.scheduledEndTime 
        ? new Date(existingShift.scheduledEndTime)
        : new Date(existingStartTime.getTime() + 90 * 60 * 1000); // Default to 90 minutes if no end time
      
      // Normalize to the same date for comparison
      const existingStartDateTime = new Date(dateOnly);
      existingStartDateTime.setHours(existingStartTime.getHours(), existingStartTime.getMinutes(), 0, 0);
      const existingEndDateTime = new Date(dateOnly);
      existingEndDateTime.setHours(existingEndTime.getHours(), existingEndTime.getMinutes(), 0, 0);
      
      // Calculate gaps in minutes
      const gapBefore = (newStartDateTime.getTime() - existingEndDateTime.getTime()) / (1000 * 60); // minutes before existing shift
      const gapAfter = (existingStartDateTime.getTime() - newEndDateTime.getTime()) / (1000 * 60); // minutes after existing shift
      
      // Check if shifts overlap or gap is less than 90 minutes
      if ((gapBefore < 90 && gapBefore > -90) || (gapAfter < 90 && gapAfter > -90)) {
        return NextResponse.json({ 
          error: 'This operator already has a shift on this date that conflicts with the requested time. There must be at least 90 minutes between shifts in different apartments.' 
        }, { status: 400 });
      }
    }

    const shift = await CleaningShift.create({
      apartment,
      cleaner,
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
      notes,
      guestCount: guestCount,
      createdBy: user._id,
      status: 'scheduled',
      confirmedSeen: {
        confirmed: false,
      },
    });

    const populatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    if (!populatedShift) {
      return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
    }

    // Get apartment name for notification
    const apartmentData = populatedShift.apartment as any;
    const apartmentName = apartmentData?.name || 'an apartment';
    
    // Create notification for operator with TOP UP title
    await Notification.create({
      user: cleaner,
      type: 'shift_assigned',
      title: 'TOP UP',
      message: `New shift assigned at ${apartmentName}`,
      relatedShift: shift._id,
    });

    // Send FCM push notification to operator's mobile device
    try {
      const { sendFCMNotification } = await import('@/lib/fcm-notifications');
      await sendFCMNotification(
        cleaner.toString(),
        'TOP UP - New Shift',
        `You have been assigned a new cleaning shift at ${apartmentName}`,
        {
          shiftId: shift._id.toString(),
          url: `/dashboard/shifts/details?id=${shift._id}`,
          type: 'shift_assigned',
        }
      );
      console.log('✅ FCM notification sent for new shift');
    } catch (pushError) {
      console.error('❌ Error sending FCM notification:', pushError);
      // Don't fail the request if push notification fails
    }

    return NextResponse.json({ shift: populatedShift }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create shift' }, { status: 500 });
  }
}

