'use client'

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api-config';
import { USE_PUSH_IOS } from '@/lib/notification-config';
import { scheduleLocalShiftReminders } from '@/lib/local-shift-reminders';

/**
 * Handles push (Android; iOS when paid) or local notifications (iOS free account).
 * Flip USE_PUSH_IOS when Apple Developer Program is active and Push capability is added.
 */
export default function CapacitorPushNotifications() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNativePlatform, setIsNativePlatform] = useState(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    setIsNativePlatform(isNative);

    if (!isNative) return;

    const useLocalIOS = platform === 'ios' && !USE_PUSH_IOS;
    if (useLocalIOS) {
      initializeLocalNotifications();
    } else {
      initializePushNotifications();
    }

    const checkPendingNotification = () => {
      const stored = sessionStorage.getItem('pendingNotification');
      if (!stored) return;
      try {
        const data = JSON.parse(stored);
        sessionStorage.removeItem('pendingNotification');
        setTimeout(() => handleNotificationClick(data), 1000);
      } catch (e) {
        console.error('Error parsing stored notification:', e);
      }
    };

    checkPendingNotification();
    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) checkPendingNotification();
    });
    return () => { stateListener.then(l => l.remove()); };
  }, [router]);

  useEffect(() => {
    if (!isNativePlatform) return;
    const platform = Capacitor.getPlatform();
    const useLocalIOS = platform === 'ios' && !USE_PUSH_IOS;
    if (useLocalIOS) return;

    setTimeout(async () => {
      try {
        const r = await apiFetch('/api/push/register');
        const ok = r.ok;
        const data = await r.json().catch(() => ({}));
        if (ok) console.log('📊 Push token status ok', (data as { userId?: string })?.userId ? '(user known)' : '');
        else console.warn('📊 Push status check not ok:', r.status, data);
      } catch (e) {
        console.warn('📊 Push status check failed:', e);
      }
    }, 3000);
  }, [isNativePlatform]);

  useEffect(() => {
    if (!isNativePlatform || Capacitor.getPlatform() !== 'ios' || USE_PUSH_IOS) return;
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ shifts: any[] }>).detail;
      if (d?.shifts) scheduleLocalShiftReminders(d.shifts);
    };
    window.addEventListener('shift-reminders-schedule', handler);
    return () => window.removeEventListener('shift-reminders-schedule', handler);
  }, [isNativePlatform]);

  // Clear notification badge when viewing notifications page
  useEffect(() => {
    if (!isNativePlatform) return;

    if (pathname === '/dashboard/notifications') {
      // User is viewing notifications - clear the badge
      clearNotificationBadge();
    }
  }, [pathname, isNativePlatform]);

  const initializeLocalNotifications = async () => {
    try {
      const status = await LocalNotifications.requestPermissions();
      if (status.display !== 'granted') {
        toast.error('Notifications disabled. Enable in settings for reminders.');
        return;
      }
      LocalNotifications.addListener('localNotificationActionPerformed', (action: any) => {
        const extra = action?.notification?.extra;
        if (extra && (extra.shiftId || extra.url)) {
          sessionStorage.setItem('pendingNotification', JSON.stringify(extra));
        }
      });
    } catch (e) {
      console.error('Local notifications init:', e);
    }
  };

  const initializePushNotifications = async () => {
    const platform = Capacitor.getPlatform();
    try {
      console.log('📱 Push init: platform=', platform);
      if (platform === 'android') {
        try {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'Default',
            description: 'Push notifications',
            importance: 4,
          });
          console.log('📱 Android default channel created');
        } catch (e) {
          console.warn('📱 Create default channel:', e);
        }
      }
      const permResult = await PushNotifications.requestPermissions();
      console.log('📱 Push permission result:', permResult?.receive ?? permResult);
      if (permResult.receive === 'granted') {
        await PushNotifications.register();
        setupPushListeners();
        console.log('📱 Push register() called, waiting for token…');
      } else {
        console.warn('📱 Push permission not granted:', permResult?.receive);
        toast.error('Push notifications are disabled. Enable them in settings for real-time updates.');
      }
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
      const useLocal = Capacitor.getPlatform() === 'ios' && !USE_PUSH_IOS;
      if (useLocal) {
        await LocalNotifications.removeAllDeliveredNotifications();
      } else {
        await PushNotifications.removeAllDeliveredNotifications();
      }
    } catch (error) {
      console.error('❌ Error clearing notification badge:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}

