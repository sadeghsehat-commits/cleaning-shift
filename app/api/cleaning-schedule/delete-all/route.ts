import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningSchedule from '@/models/CleaningSchedule';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can delete all cleaning schedules
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only administrators can delete all cleaning schedules' }, { status: 403 });
    }

    // Delete all cleaning schedules
    const result = await CleaningSchedule.deleteMany({});
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.deletedCount} cleaning schedule(s) from the database`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting all cleaning schedules:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete cleaning schedules' }, { status: 500 });
  }
}


