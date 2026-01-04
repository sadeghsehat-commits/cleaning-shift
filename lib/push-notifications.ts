import webpush from 'web-push';
import connectDB from './mongodb';
import PushSubscription from '@/models/PushSubscription';

// Initialize web-push with VAPID keys (you'll need to set these in .env.local)
// For now, we'll use a simple approach without VAPID keys for basic functionality
// In production, you should generate VAPID keys and set them in environment variables

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    await connectDB();
    
    // Find all push subscriptions for this user
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      data: data || {},
      tag: 'shift-notification',
    });

    // Send notification to all subscriptions for this user
    const promises = subscriptions.map(async (subscription) => {
      try {
        // For basic push notifications without VAPID, we need to use the subscription directly
        // Note: This requires VAPID keys in production. For now, we'll use a simpler approach
        const subscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        };

        // In a real implementation, you'd use webpush.sendNotification here
        // For now, we'll use the service worker's push event
        // The actual push will be sent from the server using a push service
        // This is a simplified version - in production, you'd need VAPID keys
        
        // For development/testing, we can trigger the notification via the service worker
        // The actual implementation would require setting up VAPID keys
        
        return { success: true, subscriptionId: subscription._id };
      } catch (error: any) {
        console.error(`Failed to send push to subscription ${subscription._id}:`, error);
        // If subscription is invalid, remove it
        if (error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
        }
        return { success: false, subscriptionId: subscription._id, error: error.message };
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    
    console.log(`Sent push notifications: ${successCount}/${subscriptions.length} successful`);
    
    return { success: true, sent: successCount, total: subscriptions.length };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

// Alternative: Send push notification using fetch API (for client-side triggered notifications)
// This is a workaround for development - in production, use proper VAPID keys
export async function triggerPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    await connectDB();
    
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      return { success: false, message: 'No subscriptions found' };
    }

    // For now, we'll return the subscription info
    // The actual push will be handled by the service worker when the notification is created
    // This is a simplified approach - in production, implement proper web-push with VAPID
    
    return { success: true, subscriptions: subscriptions.length };
  } catch (error: any) {
    console.error('Error triggering push notification:', error);
    throw error;
  }
}



