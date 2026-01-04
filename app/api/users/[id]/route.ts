import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete users
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    // Find the user to delete
    const userToDelete = await User.findById(id);
    
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin accounts
    if (userToDelete.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 403 });
    }

    // Delete related data
    // Delete shifts assigned to this user (if operator)
    if (userToDelete.role === 'operator') {
      await CleaningShift.deleteMany({ cleaner: id });
    }

    // Delete apartments owned by this user (if owner)
    if (userToDelete.role === 'owner') {
      // First, delete shifts for these apartments
      const apartments = await Apartment.find({ owner: id });
      const apartmentIds = apartments.map((apt) => apt._id);
      await CleaningShift.deleteMany({ apartment: { $in: apartmentIds } });
      // Then delete the apartments
      await Apartment.deleteMany({ owner: id });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}


