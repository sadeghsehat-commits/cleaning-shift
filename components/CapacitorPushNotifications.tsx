'use client'

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
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

  // This log runs on EVERY render - if you don't see this, the component isn't rendering
  console.log('🔔🔔🔔🔔🔔 CapacitorPushNotifications component RENDERED - THIS MUST APPEAR FOR OWNERS!!!');
  console.log('🔔🔔🔔 Component created at:', new Date().toISOString());
  
  // Also log to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__capacitorPushRendered = true;
    (window as any).__capacitorPushRenderTime = new Date().toISOString();
    console.log('🔔🔔🔔 Component registered in window.__capacitorPushRendered');
  }

  useEffect(() => {
    console.log('🔔🔔🔔 CapacitorPushNotifications useEffect TRIGGERED - THIS MUST APPEAR!!!');
    
    try {
      // Check if Capacitor is available
      if (!Capacitor) {
        console.error('❌❌❌ Capacitor is not available!');
        return;
      }
      console.log('✅✅✅ Capacitor is available');
      
      // Check if running on a native platform (iOS or Android)
      const platform = Capacitor.getPlatform();
      const isNative = platform === 'ios' || platform === 'android';
      console.log('🔔🔔🔔 Platform check:', { platform, isNative, platformType: typeof platform });
      setIsNativePlatform(isNative);

      console.log('🔔🔔🔔 Capacitor Push Notifications component loaded:', { platform, isNative });

      if (!isNative) {
        console.log('⚠️⚠️⚠️ Not a native platform, skipping Capacitor push notifications. Platform:', platform);
        return;
      }

      console.log('🔔🔔🔔 Platform is native, calling initializePushNotifications()...');
      // Initialize push notifications
      console.log('🔔🔔🔔 About to call initializePushNotifications, function exists?', typeof initializePushNotifications);
      initializePushNotifications().then(() => {
        console.log('✅✅✅ initializePushNotifications completed successfully');
      }).catch((error) => {
        console.error('❌❌❌ ERROR calling initializePushNotifications:', error);
        console.error('❌❌❌ Error stack:', error?.stack);
      });
    } catch (error) {
      console.error('❌❌❌ ERROR in CapacitorPushNotifications useEffect:', error);
    }
    
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
    
    // Check immediately and after delays
    const checkTokens = async () => {
      try {
        const response = await fetch(apiUrl('/api/push/register'), {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('📊📊📊 CURRENT USER PUSH TOKEN STATUS:', {
            userId: data.userId,
            userRole: data.userRole,
            tokenCount: data.tokenCount,
            tokens: data.tokens
          });
          
          if (data.tokenCount === 0) {
            console.error('❌❌❌ NO TOKENS FOUND FOR USER! This user will NOT receive push notifications!');
            console.error('❌❌❌ User role:', data.userRole, 'User ID:', data.userId);
          } else {
            console.log('✅✅✅ TOKENS FOUND! User has', data.tokenCount, 'registered token(s)');
          }
        }
      } catch (error) {
        console.error('❌ Error checking push tokens:', error);
      }
    };
    
    // Check immediately
    checkTokens();
    
    // Check after 3 seconds (in case token is still registering)
    setTimeout(checkTokens, 3000);
    
    // Check after 10 seconds (final check)
    setTimeout(checkTokens, 10000);
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
      console.log('🔔🔔🔔 INITIALIZING Capacitor Push Notifications - THIS SHOULD APPEAR FOR OWNERS!!!');

      // Request permission to use push notifications
      const permResult = await PushNotifications.requestPermissions();
      console.log('🔔 Permission result:', permResult);
      console.log('🔔 Permission granted?', permResult.receive === 'granted');

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
        const response = await fetch(apiUrl('/api/push/register'), {
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
          const responseData = await response.json();
          console.log('✅✅✅ TOKEN SAVED TO BACKEND SUCCESSFULLY!!!', responseData);
          console.log('✅✅✅ User role:', responseData.userRole, 'User ID:', responseData.userId);
          toast.success('Push notifications enabled!');
          
          // Verify token was saved by checking immediately
          setTimeout(async () => {
            try {
              const checkResponse = await fetch(apiUrl('/api/push/register'), {
                credentials: 'include',
              });
              if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                console.log('✅✅✅ VERIFIED: Token count after registration:', checkData.tokenCount);
                if (checkData.tokenCount === 0) {
                  console.error('❌❌❌ WARNING: Token was not saved! Token count is still 0!');
                }
              }
            } catch (e) {
              console.error('❌ Error verifying token:', e);
            }
          }, 1000);
        } else {
          const errorText = await response.text();
          console.error('❌❌❌ FAILED to save token to backend:', response.status, errorText);
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
      
      // Store notification data
      sessionStorage.setItem('pendingNotification', JSON.stringify(notificationData));
      
      // Always try to navigate (works whether app was open or closed)
      // Use a longer delay to ensure app is ready
      setTimeout(() => {
        console.log('🔗 Attempting navigation from notification click...');
        handleNotificationClick(notificationData);
      }, 800);
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

