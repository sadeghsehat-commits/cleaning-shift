import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can delete all shifts
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only administrators can delete all shifts' }, { status: 403 });
    }

    // Delete all shifts
    const result = await CleaningShift.deleteMany({});
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.deletedCount} shift(s) from the database` 
    });
  } catch (error: any) {
    console.error('Error deleting all shifts:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete shifts' }, { status: 500 });
  }
}



