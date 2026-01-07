import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { sendFCMNotification } from '@/lib/fcm-notifications';

/**
 * POST /api/push/test
 * 
 * Test endpoint to send a test FCM notification to the current user.
 * Only works for authenticated users who have registered an FCM token.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Testing FCM notification for user:', user._id);

    // Send test notification
    const result = await sendFCMNotification(
      user._id.toString(),
      '🧪 Test Notification',
      'If you see this on your home screen, FCM is working! 🎉',
      {
        type: 'test',
        url: '/dashboard/notifications',
      }
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Test notification sent!',
        sent: result.sent,
        failed: result.failed,
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: result.reason === 'no_tokens' 
          ? 'No FCM tokens found. Make sure you opened the mobile app at least once.'
          : 'Failed to send notification',
        error: result.error || result.reason,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error in test endpoint:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send test notification' 
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/push/test
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

