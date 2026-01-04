'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PushNotificationManager() {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if pushManager is available
      if (!registration.pushManager) {
        console.log('Push Manager not available');
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      // Also check our database subscription
      if (subscription) {
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
        if (response.ok) {
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, []);

  // Helper function to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const subscribeToPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if pushManager is available
      if (!registration.pushManager) {
        console.log('Push Manager not available - using browser notifications only');
        // Still enable notifications, just without push subscription
        setIsSubscribed(true);
        toast.success('Browser notifications enabled!');
        return;
      }

      // For now, we'll use a simple subscription without VAPID keys
      // In production, you'd generate VAPID keys and use them here
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        try {
          // Create a subscription (without VAPID for now - this is a simplified approach)
          // Note: Real push notifications require VAPID keys
          // For now, we'll use browser notifications triggered by polling or websockets
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            // In production, add: applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        } catch (subscribeError: any) {
          console.error('Error creating push subscription:', subscribeError);
          // If subscription fails, still enable browser notifications
          setIsSubscribed(true);
          toast.success('Browser notifications enabled! (Push subscription unavailable)');
          return;
        }
      }

      // Save subscription to our database
      if (subscription) {
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
              },
            },
          }),
        });

        if (response.ok) {
          setIsSubscribed(true);
          toast.success('Push notifications enabled!');
        } else {
          toast.error('Failed to enable push notifications');
        }
      }
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      // Even if push subscription fails, browser notifications will still work
      setIsSubscribed(true);
      toast.success('Browser notifications enabled! (Limited functionality)');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      toast.success('Notification permission granted!');
      await subscribeToPush();
    } else if (permission === 'denied') {
      toast.error('Notification permission denied. Please enable it in your browser settings.');
    }
  }, [subscribeToPush]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if pushManager is available
      if (!registration.pushManager) {
        setIsSubscribed(false);
        toast.success('Notifications disabled');
        return;
      }

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from our database
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to disable push notifications');
    }
  }, []);

  // Initialize and check subscription
  useEffect(() => {
    // Check if browser supports notifications and service workers
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if already subscribed
      checkSubscription();

      // Auto-request permission if not granted and not denied (for operators)
      // On iOS, we need to be more careful about when we request
      if (Notification.permission === 'default') {
        // Check if we're on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // On iOS, wait a bit longer and check if app is installed (standalone mode)
        const isStandalone = (window.navigator as any).standalone || 
          window.matchMedia('(display-mode: standalone)').matches;
        
        if (isIOS && !isStandalone) {
          // On iOS Safari (not installed), show a message instead of auto-requesting
          console.log('iOS Safari detected - please add to home screen for notifications');
        } else {
          // Request permission after a short delay
          setTimeout(() => {
            requestPermission();
          }, 2000);
        }
      }
    }
  }, [checkSubscription, requestPermission]);

  // Listen for new notifications and show browser notifications
  useEffect(() => {
    if (permission !== 'granted' || !isSupported) {
      console.log('Notifications not enabled:', { permission, isSupported });
      return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = (window.navigator as any).standalone || 
      window.matchMedia('(display-mode: standalone)').matches;

    console.log('Notification check setup:', { isIOS, isStandalone, permission });

    // Poll for new notifications (in production, use websockets or server-sent events)
    const checkForNewNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unreadNotifications = data.notifications?.filter((n: any) => !n.read) || [];

          if (unreadNotifications.length > 0) {
            // Show notification for the most recent unread that we haven't shown yet
            const latest = unreadNotifications[0];
            const notificationId = latest._id;
            
            // Show notification for any unread notification (not just TOP UP)
            if (notificationId !== lastNotificationId) {
              console.log('New notification detected:', latest.title);
              
              try {
                // On iOS, prefer browser Notification API directly
                if (isIOS) {
                  if ('Notification' in window && Notification.permission === 'granted') {
                    console.log('Showing iOS notification via browser API');
                    const notification = new Notification(latest.title || 'New Notification', {
                      body: latest.message || 'You have a new notification',
                      icon: '/icon-192x192.png',
                      badge: '/icon-192x192.png',
                      tag: `notification-${notificationId}`,
                    });
                    
                    // Handle notification click
                    notification.onclick = () => {
                      window.focus();
                      const url = latest.relatedShift ? `/dashboard/shifts/${latest.relatedShift}` : '/dashboard/notifications';
                      window.location.href = url;
                      notification.close();
                    };
                    
                    setLastNotificationId(notificationId);
                    return;
                  }
                }
                
                // For non-iOS or if iOS browser API fails, try service worker
                if ('serviceWorker' in navigator) {
                  try {
                    const registration = await navigator.serviceWorker.ready;
                    console.log('Service worker ready, checking showNotification:', typeof registration.showNotification);
                    
                    // Check if showNotification is available
                    if (registration && typeof registration.showNotification === 'function') {
                      console.log('Using service worker notification');
                      await registration.showNotification(latest.title || 'New Notification', {
                        body: latest.message || 'You have a new notification',
                        icon: '/icon-192x192.png',
                        badge: '/icon-192x192.png',
                        tag: `notification-${notificationId}`,
                        data: {
                          url: latest.relatedShift ? `/dashboard/shifts/${latest.relatedShift}` : '/dashboard/notifications',
                          shiftId: latest.relatedShift,
                          notificationId: notificationId,
                        },
                        vibrate: [200, 100, 200],
                        requireInteraction: false,
                        silent: false,
                      } as NotificationOptions);
                      setLastNotificationId(notificationId);
                      return; // Success, exit early
                    } else {
                      console.log('showNotification not available on registration, using browser API');
                    }
                  } catch (swError) {
                    console.error('Service worker notification failed:', swError);
                  }
                }
                
                // Fallback to browser Notification API
                if ('Notification' in window && Notification.permission === 'granted') {
                  console.log('Using browser Notification API as fallback');
                  const notification = new Notification(latest.title || 'New Notification', {
                    body: latest.message || 'You have a new notification',
                    icon: '/icon-192x192.png',
                    tag: `notification-${notificationId}`,
                    badge: '/icon-192x192.png',
                  });
                  
                  // Handle notification click
                  notification.onclick = () => {
                    window.focus();
                    const url = latest.relatedShift ? `/dashboard/shifts/${latest.relatedShift}` : '/dashboard/notifications';
                    window.location.href = url;
                    notification.close();
                  };
                  
                  setLastNotificationId(notificationId);
                }
              } catch (notifError) {
                console.error('Error showing notification:', notifError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check immediately
    checkForNewNotifications();

    // Poll every 15 seconds for new notifications (more frequent for better UX)
    const interval = setInterval(checkForNewNotifications, 15000);

    return () => clearInterval(interval);
  }, [permission, isSupported, lastNotificationId]);

  // Handle notification clicks and navigation
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          const url = event.data.url || '/dashboard/notifications';
          router.push(url);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [router]);

  // This component doesn't render anything visible
  // It just manages push notifications in the background
  return null;
}

