import connectDB from './mongodb';
import PushToken from '@/models/PushToken';

// Firebase Admin SDK - initialized lazily
let adminInitialized = false;
let messaging: any = null;

/**
 * Initialize Firebase Admin SDK
 * Only initializes once, subsequent calls return immediately
 */
async function initializeFirebaseAdmin() {
  if (adminInitialized) return;

  try {
    // Check if service account key is available
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set - FCM notifications will not work');
      return;
    }

    // Dynamically import firebase-admin (only on server)
    const admin = require('firebase-admin');

    // Parse service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized');
    }

    messaging = admin.messaging();
    adminInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

/**
 * Send a push notification to a user's device(s)
 * 
 * @param userId - The user's MongoDB ObjectId
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data (e.g., shiftId, url)
 */
export async function sendFCMNotification(
  userId: string,
  title: string,
  body: string,
  data?: { shiftId?: string; url?: string; [key: string]: any }
) {
  try {
    await connectDB();
    
    // Find all push tokens for this user
    const pushTokens = await PushToken.find({ user: userId });

    if (pushTokens.length === 0) {
      console.log(`📱 No FCM tokens found for user ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    console.log(`📱 Found ${pushTokens.length} FCM token(s) for user ${userId}`);

    // Initialize Firebase Admin
    await initializeFirebaseAdmin();

    if (!messaging) {
      console.warn('⚠️ Firebase Admin not initialized - skipping FCM send');
      return { 
        success: false, 
        reason: 'firebase_not_initialized',
        message: 'Firebase Admin SDK not available'
      };
    }

    // Send notification to all tokens
    const results = [];

    for (const tokenDoc of pushTokens) {
      try {
        // Convert data to string format (FCM requirement)
        const stringData: Record<string, string> = {};
        if (data) {
          Object.keys(data).forEach(key => {
            stringData[key] = String(data[key]);
          });
        }

        // Get unread notification count for this user to set badge
        const Notification = (await import('@/models/Notification')).default;
        const unreadCount = await Notification.countDocuments({
          user: userId,
          read: false,
        });

        console.log(`📊 Unread notifications for user ${userId}: ${unreadCount}`);

        const message = {
          token: tokenDoc.token,
          notification: {
            title,
            body,
          },
          data: stringData,
          android: {
            priority: 'high' as const,
            notification: {
              sound: 'default',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              channelId: 'default',
              notificationCount: unreadCount, // Set badge count for Android
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: unreadCount, // Set badge count for iOS
                contentAvailable: true,
              },
            },
          },
        };

        const response = await messaging.send(message);
        console.log('✅ FCM notification sent:', {
          userId,
          platform: tokenDoc.platform,
          title,
          response
        });
        results.push({ success: true, token: tokenDoc.token.substring(0, 20) + '...', response });
      } catch (error: any) {
        console.error('❌ FCM send failed:', error);
        
        // Remove invalid tokens
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          await PushToken.deleteOne({ _id: tokenDoc._id });
          console.log('🗑️ Removed invalid token');
        }
        
        results.push({ success: false, token: tokenDoc.token.substring(0, 20) + '...', error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return {
      success: successCount > 0,
      sent: successCount,
      failed: failCount,
      results,
    };
  } catch (error: any) {
    console.error('❌ Error sending FCM notification:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Send a notification to multiple users
 */
export async function sendFCMNotificationToMultipleUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: { shiftId?: string; url?: string; [key: string]: any }
) {
  const results = [];
  
  for (const userId of userIds) {
    const result = await sendFCMNotification(userId, title, body, data);
    results.push({ userId, ...result });
  }
  
  return results;
}

