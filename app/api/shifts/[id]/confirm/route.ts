import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

    // Only operators can confirm seeing shifts
    if (user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    // Ensure Apartment model is registered before populate
    // The import at the top should register it, but we ensure it's available
    // by checking mongoose.models (this forces the model to be registered if imported)
    const ApartmentModel = mongoose.models.Apartment || Apartment;
    
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'name owner')
      .populate('cleaner', 'name email');
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Operators can only confirm their own shifts
    // Handle both populated object and ObjectId
    let cleanerId: string;
    if (shift.cleaner && typeof shift.cleaner === 'object' && '_id' in shift.cleaner) {
      // If populated, it's an object with _id
      cleanerId = (shift.cleaner as any)._id.toString();
    } else if (shift.cleaner) {
      // If not populated, it's an ObjectId or string
      cleanerId = typeof shift.cleaner === 'string' 
        ? shift.cleaner 
        : (shift.cleaner as any).toString();
    } else {
      return NextResponse.json({ error: 'Shift has no cleaner assigned' }, { status: 400 });
    }
    const userId = user._id.toString();
    
    if (cleanerId !== userId) {
      console.error('Cleaner ID mismatch:', { cleanerId, userId, cleaner: shift.cleaner });
      return NextResponse.json({ 
        error: 'Forbidden: You can only confirm your own shifts',
        details: { cleanerId, userId }
      }, { status: 403 });
    }

    // Confirm the shift
    shift.confirmedSeen = {
      confirmed: true,
      confirmedAt: new Date(),
    };

    await shift.save();

    // Note: Notifications for "Shift Confirmed by Operator" are no longer sent to owners and admins
    // Only the operator who confirms the shift needs to know it's confirmed

    const updatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    return NextResponse.json({ shift: updatedShift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to confirm shift' }, { status: 500 });
  }
}

