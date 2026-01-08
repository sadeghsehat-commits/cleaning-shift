import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can delete all notifications
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only administrators can delete all notifications' }, { status: 403 });
    }

    // Delete all notifications
    const result = await Notification.deleteMany({});
    
    return NextResponse.json({ 
      message: `Successfully deleted ${result.deletedCount} notification(s) from the database` 
    });
  } catch (error: any) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete notifications' }, { status: 500 });
  }
}




