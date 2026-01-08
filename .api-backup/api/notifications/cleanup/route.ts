import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify this is a cron request (uncomment if you set CRON_SECRET in Vercel)
    // const authHeader = request.headers.get('authorization');
    // const cronSecret = process.env.CRON_SECRET;
    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    // Get current time
    const now = new Date();
    
    // Calculate cutoff time: 24 hours ago (for read notifications)
    const readCutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Delete all notifications that have been read for more than 24 hours
    const readNotificationsResult = await Notification.deleteMany({
      read: true,
      readAt: { $lt: readCutoffTime },
    });

    const totalDeleted = readNotificationsResult.deletedCount;

    console.log(`Notification cleanup completed: ${readNotificationsResult.deletedCount} read notifications deleted (24h after reading), total: ${totalDeleted}`);

    return NextResponse.json({
      success: true,
      deleted: {
        readNotifications: readNotificationsResult.deletedCount,
        total: totalDeleted,
      },
      cutoffTime: {
        readAt: readCutoffTime.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error cleaning up notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup notifications' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}

