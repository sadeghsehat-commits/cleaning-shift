import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningSchedule from '@/models/CleaningSchedule';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { format } from 'date-fns';

// GET: Retrieve cleaning schedule for apartments
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get('apartmentId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let query: any = {};

    // Owners can only see their own apartments' schedules, admins can see all
    if (user.role === 'owner') {
      const apartments = await Apartment.find({ owner: user._id });
      const apartmentIds = apartments.map(apt => apt._id);
      const apartmentIdsStrings = apartmentIds.map(id => id.toString());
      
      // If specific apartmentId is requested, verify it belongs to the owner and filter by it
      if (apartmentId) {
        // Convert apartmentIds to strings for comparison
        if (apartmentIdsStrings.includes(apartmentId)) {
          // MongoDB handles string to ObjectId conversion automatically
          query.apartment = apartmentId;
        } else {
          // Apartment doesn't belong to owner, return empty
          console.log(`Owner ${user._id} tried to access apartment ${apartmentId} which doesn't belong to them. Available: ${apartmentIdsStrings.join(', ')}`);
          return NextResponse.json({ schedules: [] });
        }
      } else {
        // No specific apartment requested, return all owner's apartments (use ObjectIds)
        query.apartment = { $in: apartmentIds };
      }
    } else if (apartmentId) {
      // Admins can see any apartment - MongoDB will handle string to ObjectId conversion
      query.apartment = apartmentId;
    }

    if (year) {
      query.year = parseInt(year);
    }
    if (month) {
      query.month = parseInt(month);
    }

    const schedules = await CleaningSchedule.find(query)
      .populate('apartment', 'name address owner')
      .sort({ year: 1, month: 1, apartment: 1 });

    console.log(`API GET: Found ${schedules.length} schedules for query:`, JSON.stringify(query));
    if (schedules.length > 0) {
      const firstSchedule = schedules[0] as any;
      console.log(`API GET: First schedule apartment ID:`, firstSchedule.apartment?._id || firstSchedule.apartment);
    }

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error('Error fetching cleaning schedules:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch cleaning schedules' }, { status: 500 });
  }
}

// POST: Create or update cleaning schedule
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['owner', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Only owners and admins can manage cleaning schedules' }, { status: 403 });
    }

    const body = await request.json();
    const { apartmentId, year, month, days, scheduledDays, bookings, notifyAdmin } = body;

    if (!apartmentId || !year || !month) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    // Verify apartment belongs to owner (admins can manage any apartment)
    if (user.role === 'owner') {
      const ownerId = apartment.owner.toString();
      const userId = user._id.toString();
      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only manage schedules for your own apartments' }, { status: 403 });
      }
    }

    // Support new format (bookings array) and old formats for backward compatibility
    let finalBookings: Array<{checkIn: Date, checkOut: Date, guestCount: number}> = [];
    
    if (bookings !== undefined && Array.isArray(bookings)) {
      // New format with check-in/check-out dates
      if (bookings.length === 0) {
        finalBookings = []; // Explicitly empty - will clear the schedule
      } else {
        finalBookings = bookings
          .filter((item: any) => {
            if (!item.checkIn || !item.checkOut || !item.guestCount) return false;
            const checkIn = new Date(item.checkIn);
            const checkOut = new Date(item.checkOut);
            return checkOut > checkIn && item.guestCount >= 1;
          })
          .map((item: any) => ({
            checkIn: new Date(item.checkIn),
            checkOut: new Date(item.checkOut),
            guestCount: item.guestCount || 1,
          }));
      }
    } else if (scheduledDays !== undefined && Array.isArray(scheduledDays)) {
      // Old format with scheduledDays - convert to bookings (each day becomes a single-day booking)
      finalBookings = scheduledDays
        .filter((item: any) => item.day >= 1 && item.day <= 31 && item.guestCount >= 1)
        .map((item: any) => {
          const date = new Date(year, month - 1, item.day);
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          return {
            checkIn: date,
            checkOut: nextDay,
            guestCount: item.guestCount || 1,
          };
        });
    } else if (days !== undefined && Array.isArray(days)) {
      // Oldest format - convert to bookings
      const validDays = days.filter((day: number) => day >= 1 && day <= 31);
      finalBookings = validDays.map((day: number) => {
        const date = new Date(year, month - 1, day);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        return {
          checkIn: date,
          checkOut: nextDay,
          guestCount: 1,
        };
      });
    } else {
      return NextResponse.json({ error: 'Missing bookings, days, or scheduledDays array' }, { status: 400 });
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    // Get existing schedule
    const existingSchedule = await CleaningSchedule.findOne({
      apartment: apartmentId,
      year,
      month,
    });

    // If bookings is empty, delete the schedule instead of updating it
    if (finalBookings.length === 0) {
      await CleaningSchedule.findOneAndDelete({ apartment: apartmentId, year, month });
      return NextResponse.json({ schedule: null, deleted: true });
    }

    // Create or update schedule with bookings
    const schedule = await CleaningSchedule.findOneAndUpdate(
      { apartment: apartmentId, year, month },
      { 
        bookings: finalBookings,
      },
      { upsert: true, new: true }
    ).populate('apartment', 'name address owner');

    // Send notifications to admins if requested
    if (notifyAdmin && user.role === 'owner') {
      try {
        const apartment = schedule.apartment as any;
        const owner = await User.findById(user._id);
        const admins = await User.find({ role: 'admin' });

        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        const bookingsList = finalBookings.map(b => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          return `${format(checkIn, 'MMM d')} - ${format(checkOut, 'MMM d')} (${b.guestCount} ${b.guestCount === 1 ? 'guest' : 'guests'})`;
        }).join(', ');

        if (finalBookings.length > 0) {
          for (const admin of admins) {
            await Notification.create({
              user: admin._id,
              type: 'calendar_updated_new_days',
              title: 'New Bookings Added',
              message: `${owner?.name || 'Owner'} added new bookings for ${apartment.name}: ${bookingsList} in ${monthName} ${year}`,
            });
          }
        }
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error('Error saving cleaning schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to save cleaning schedule' }, { status: 500 });
  }
}

