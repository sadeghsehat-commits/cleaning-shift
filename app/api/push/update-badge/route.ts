import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { sendFCMNotification } from '@/lib/fcm-notifications';

/**
 * POST /api/push/update-badge
 * 
 * Updates the notification badge count by sending a silent FCM notification.
 * This is called when notifications are marked as read/unread.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current unread count
    const Notification = (await import('@/models/Notification')).default;
    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    console.log(`📊 Updating badge count for user ${user._id}: ${unreadCount}`);

    // Send a silent notification to update badge count
    // For Android, we send with notificationCount
    // For iOS, we send with badge
    const result = await sendFCMNotification(
      user._id.toString(),
      '', // Empty title for silent notification
      '', // Empty body for silent notification
      {
        type: 'badge_update',
        count: String(unreadCount),
      }
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        unreadCount,
        message: 'Badge count updated',
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: result.error || result.reason,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error updating badge:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update badge' 
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/push/update-badge
 * 
 * CORS preflight handler
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

