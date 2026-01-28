'use client'

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiUrl, apiFetch } from '@/lib/api-config';

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

  console.log('🔔🔔🔔 CapacitorPushNotifications component RENDERED - THIS SHOULD APPEAR FOR OWNERS!!!');

  useEffect(() => {
    console.log('🔔 CapacitorPushNotifications useEffect triggered');
    
    // Check if running on a native platform (iOS or Android)
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    setIsNativePlatform(isNative);

    console.log('🔔 Capacitor Push Notifications component loaded:', { platform, isNative });

    if (!isNative) {
      console.log('⚠️ Not a native platform, skipping Capacitor push notifications');
      return;
    }

    // Initialize push notifications
    initializePushNotifications();
    
    // Check for pending notification on app startup (in case app was opened from notification)
    const checkPendingNotification = () => {
      const storedNotification = sessionStorage.getItem('pendingNotification');
      if (storedNotification) {
        try {
          const data = JSON.parse(storedNotification);
          sessionStorage.removeItem('pendingNotification');
          console.log('📱 Found pending notification, navigating...', data);
          // Navigate after a delay to ensure app is fully loaded
          setTimeout(() => {
            handleNotificationClick(data);
          }, 1000);
        } catch (e) {
          console.error('Error parsing stored notification:', e);
        }
      }
    };
    
    // Check immediately (in case app just opened)
    checkPendingNotification();
    
    // Also check when app becomes active
    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('📱 App became active - checking for pending navigation');
        checkPendingNotification();
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      stateListener.then(listener => listener.remove());
    };
  }, [router]);

  // Check if user has registered tokens (for debugging)
  useEffect(() => {
    if (!isNativePlatform) return;
    
    // After a delay, check if tokens are registered
    setTimeout(async () => {
      try {
        const response = await apiFetch('/api/push/register', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Current user push token status:', data);
        }
      } catch (error) {
        console.error('❌ Error checking push tokens:', error);
      }
    }, 3000); // Check after 3 seconds
  }, [isNativePlatform]);

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
      console.log('✅ Push registration success, token:', token.value.substring(0, 20) + '...');

      // Send token to backend to save for this user
      try {
        console.log('📤 Sending token to backend for registration...');
        const response = await apiFetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            token: token.value,
            platform: Capacitor.getPlatform(),
          }),
        });

        console.log('📥 Token registration response:', response.status);

        if (response.ok) {
          console.log('✅ Token saved to backend successfully');
          toast.success('Push notifications enabled!');
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to save token to backend:', response.status, errorText);
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
      
      // Tell notifications page to refetch so list "tops up"
      try {
        window.dispatchEvent(new CustomEvent('notification-list-refresh'));
      } catch (e) { /* ignore */ }
      
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
    PushNotifications.addListener('pushNotificationActionPerformed', async (action: ActionPerformed) => {
      console.log('📱 Push notification action performed:', action);
      console.log('📱 Notification data:', action.notification.data);
      console.log('📱 Notification title:', action.notification.title);
      console.log('📱 Notification body:', action.notification.body);
      
      const notificationData = action.notification.data;
      
      if (!notificationData) {
        console.log('⚠️ No notification data, cannot navigate');
        return;
      }
      
      // Store notification data so that it can be handled AFTER the app/dashboard
      // is fully loaded and the user is authenticated.
      sessionStorage.setItem('pendingNotification', JSON.stringify(notificationData));
      console.log('💾 Stored pending notification in sessionStorage; navigation will run after app is ready.');
    });
  };

  const handleNotificationClick = async (data: any) => {
    console.log('🔗 Handling notification click with data:', data);
    
    // For mobile apps, use window.location.href directly (more reliable than router.push)
    // This ensures the app navigates even if the app was closed
    try {
      let targetUrl = '/dashboard/notifications';
      
      if (data?.shiftId) {
        targetUrl = `/dashboard/shifts/details?id=${data.shiftId}`;
        console.log('🔗 Navigating to shift details:', targetUrl);
      } else if (data?.url) {
        targetUrl = data.url;
        console.log('🔗 Navigating to URL:', targetUrl);
      } else {
        console.log('🔗 No shiftId or url, navigating to notifications page');
      }
      
      // Use window.location.href for mobile apps (works better than router.push)
      // This ensures navigation happens even if the app was closed
      window.location.href = targetUrl;
      
      // Also try router.push as backup (won't hurt if window.location already navigated)
      setTimeout(() => {
        try {
          router.push(targetUrl);
        } catch (err) {
          // Ignore - window.location already handled it
        }
      }, 100);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Final fallback
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

