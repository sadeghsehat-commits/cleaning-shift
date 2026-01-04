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

    // Get apartment owner
    const apartment = shift.apartment as any;
    const operator = shift.cleaner as any;
    const apartmentName = apartment?.name || 'the apartment';
    const operatorName = operator?.name || user.name || 'Operator';

    // Notify apartment owner
    // Apartment owner is an ObjectId reference, not populated
    let ownerId: mongoose.Types.ObjectId | string | null = null;
    if (apartment?.owner) {
      // Handle both ObjectId and string
      if (apartment.owner instanceof mongoose.Types.ObjectId) {
        ownerId = apartment.owner;
      } else if (typeof apartment.owner === 'object' && (apartment.owner as any)._id) {
        ownerId = (apartment.owner as any)._id;
      } else {
        ownerId = apartment.owner.toString();
      }
    }
    
    if (ownerId) {
      await Notification.create({
        user: ownerId,
        type: 'shift_confirmed',
        title: 'Shift Confirmed by Operator',
        message: `${operatorName} has confirmed they saw the shift for ${apartmentName}.`,
        relatedShift: shift._id,
      });
    }

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'shift_confirmed',
        title: 'Shift Confirmed by Operator',
        message: `${operatorName} has confirmed they saw the shift for ${apartmentName}.`,
        relatedShift: shift._id,
      });
    }

    const updatedShift = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    return NextResponse.json({ shift: updatedShift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to confirm shift' }, { status: 500 });
  }
}

