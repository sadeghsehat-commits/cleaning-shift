'use client'

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiUrl } from '@/lib/api-config';

/**
 * CapacitorPushNotifications Component
 * 
 * This component handles native push notifications for iOS and Android using Capacitor.
 * It replaces the Web Push API (which only works when app is open) with native notifications
 * that appear on the home screen even when the app is closed.
 * 
 * Features:
 * - Auto-registers for push notifications on mobile devices
 * - Saves FCM token to backend for sending notifications
 * - Handles notification taps to navigate to related content
 * - Shows notifications on home screen (not just in-app)
 */
export default function CapacitorPushNotifications() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNativePlatform, setIsNativePlatform] = useState(false);

  useEffect(() => {
    // Check if running on a native platform (iOS or Android)
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    setIsNativePlatform(isNative);

    console.log('🔔 Capacitor Push Notifications:', { platform, isNative });

    if (!isNative) {
      console.log('⚠️ Not a native platform, skipping Capacitor push notifications');
      return;
    }

    // Initialize push notifications
    initializePushNotifications();
  }, []);

  // Clear notification badge when viewing notifications page
  useEffect(() => {
    if (!isNativePlatform) return;

    if (pathname === '/dashboard/notifications') {
      // User is viewing notifications - clear the badge
      clearNotificationBadge();
    }
  }, [pathname, isNativePlatform]);

  const initializePushNotifications = async () => {
    try {
      console.log('🔔 Initializing Capacitor Push Notifications...');

      // Request permission to use push notifications
      const permResult = await PushNotifications.requestPermissions();
      console.log('🔔 Permission result:', permResult);

      if (permResult.receive === 'granted') {
        console.log('✅ Push notification permission granted');
        
        // Register with Apple / Google to receive push notifications
        await PushNotifications.register();
        console.log('✅ Registered for push notifications');
      } else {
        console.log('❌ Push notification permission denied');
        toast.error('Push notifications are disabled. Enable them in settings for real-time updates.');
      }

      // Setup listeners
      setupPushListeners();
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  };

  const setupPushListeners = () => {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ Push registration success, token:', token.value);
      
      // Send token to backend to save for this user
      try {
        const response = await fetch(apiUrl('/api/push/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            token: token.value,
            platform: Capacitor.getPlatform(),
          }),
        });

        if (response.ok) {
          console.log('✅ Token saved to backend');
          toast.success('Push notifications enabled!');
        } else {
          console.error('❌ Failed to save token to backend:', response.status);
        }
      } catch (error) {
        console.error('❌ Error saving token to backend:', error);
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ Push registration error:', error);
      toast.error('Failed to enable push notifications');
    });

    // Show notification when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('📬 Push notification received (foreground):', notification);
      
      // Show a toast notification when app is open
      toast((t) => (
        <div onClick={() => {
          toast.dismiss(t.id);
          handleNotificationClick(notification.data);
        }} className="cursor-pointer">
          <div className="font-bold">{notification.title}</div>
          <div className="text-sm">{notification.body}</div>
          <div className="text-xs text-gray-500 mt-1">Tap to view</div>
        </div>
      ), {
        duration: 5000,
        icon: '🔔',
      });
    });

    // Handle notification tap/click
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('📱 Push notification action performed:', action);
      console.log('📱 Notification data:', action.notification.data);
      console.log('📱 Notification title:', action.notification.title);
      console.log('📱 Notification body:', action.notification.body);
      
      // Small delay to ensure app is ready for navigation
      setTimeout(() => {
        handleNotificationClick(action.notification.data);
      }, 100);
    });
  };

  const handleNotificationClick = async (data: any) => {
    console.log('🔗 Handling notification click with data:', data);
    
    // Navigate FIRST before clearing badge
    try {
      if (data?.shiftId) {
        const shiftDetailsUrl = `/dashboard/shifts/details?id=${data.shiftId}`;
        console.log('🔗 Navigating to shift details:', shiftDetailsUrl);
        router.push(shiftDetailsUrl);
      } else if (data?.url) {
        console.log('🔗 Navigating to URL:', data.url);
        router.push(data.url);
      } else {
        console.log('🔗 No shiftId or url, navigating to notifications page');
        router.push('/dashboard/notifications');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: try window.location if router.push fails
      if (data?.shiftId) {
        window.location.href = `/dashboard/shifts/details?id=${data.shiftId}`;
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        window.location.href = '/dashboard/notifications';
      }
    }
    
    // Clear notification badge AFTER navigation starts (don't wait for it)
    // This allows navigation to happen while badge is cleared
    clearNotificationBadge().catch(err => console.error('Error clearing badge:', err));
  };

  const clearNotificationBadge = async () => {
    try {
      // Remove all delivered notifications - this clears the badge on Android
      await PushNotifications.removeAllDeliveredNotifications();
      console.log('✅ Badge cleared - removed all delivered notifications');
    } catch (error) {
      console.error('❌ Error clearing notification badge:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}

