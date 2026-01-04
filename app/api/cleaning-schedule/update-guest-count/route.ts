import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningSchedule from '@/models/CleaningSchedule';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

// POST: Update guest count for a specific day in cleaning schedule
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and owners can update guest count
    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only admins and owners can update guest count' }, { status: 403 });
    }

    const body = await request.json();
    const { apartmentId, year, month, scheduledDays } = body;

    if (!apartmentId || !year || !month || !scheduledDays || !Array.isArray(scheduledDays)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    // If owner, verify apartment belongs to owner
    if (user.role === 'owner') {
      const ownerId = apartment.owner.toString();
      const userId = user._id.toString();
      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only update guest count for your own apartments' }, { status: 403 });
      }
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    // Validate scheduledDays array
    const validScheduledDays = scheduledDays
      .filter((item: any) => item.day >= 1 && item.day <= 31 && item.guestCount >= 1)
      .map((item: any) => ({
        day: item.day,
        guestCount: item.guestCount || 1,
      }))
      .sort((a, b) => a.day - b.day);

    // Extract days array for backward compatibility
    const daysArray = validScheduledDays.map(sd => sd.day);

    // Update or create schedule
    const schedule = await CleaningSchedule.findOneAndUpdate(
      { apartment: apartmentId, year, month },
      { 
        days: daysArray, // Keep for backward compatibility
        scheduledDays: validScheduledDays,
      },
      { upsert: true, new: true }
    ).populate('apartment', 'name address owner');

    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error('Error updating guest count:', error);
    return NextResponse.json({ error: error.message || 'Failed to update guest count' }, { status: 500 });
  }
}


