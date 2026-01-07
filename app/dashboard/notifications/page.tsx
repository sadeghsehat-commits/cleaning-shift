'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedShift?: string | { _id: string };
  shiftDetails?: {
    apartmentName: string;
    apartmentAddress: string;
    scheduledDate: string;
    scheduledStartTime: string;
    scheduledEndTime?: string;
    confirmed: boolean;
  };
  timeChangeDetails?: {
    newStartTime: string;
    newEndTime?: string;
    reason?: string;
    operatorConfirmed: boolean;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Clear notification badge when viewing notifications (mobile only)
      clearMobileNotificationBadge();
    }
  }, [user]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    // Check if app is installed (standalone mode)
    const standalone = (window.navigator as any).standalone || 
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    // Check if running in Capacitor (mobile app)
    const isMobile = window.location.hostname === 'localhost' || 
                     window.location.protocol === 'file:' ||
                     window.location.protocol === 'capacitor:';
    setIsMobileApp(isMobile);
  }, []);

  const clearMobileNotificationBadge = async () => {
    // Only for mobile apps
    if (!isMobileApp) return;
    
    try {
      // Dynamically import Capacitor to avoid errors on web
      const { Capacitor } = await import('@capacitor/core');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        await PushNotifications.removeAllDeliveredNotifications();
        console.log('✅ Cleared notification badge');
      }
    } catch (error) {
      console.log('⚠️ Could not clear notification badge:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(apiUrl('/api/notifications'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch(apiUrl('/api/notifications'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationIds, read: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleConfirmShift = async (shiftId: string, notificationId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/shifts/${shiftId}/confirm`), {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Shift confirmed!');
        // Mark notification as read
        await markAsRead([notificationId]);
        fetchNotifications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to confirm shift');
        console.error('Confirm shift error:', data);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      console.error('Confirm shift exception:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast.success('Notification permission granted! You will now receive push notifications.');
      
      // Test notification immediately
      setTimeout(() => {
        try {
          const testNotification = new Notification('Test Notification', {
            body: 'If you see this, notifications are working!',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
          });
          
          testNotification.onclick = () => {
            testNotification.close();
          };
          
          // Auto-close after 3 seconds
          setTimeout(() => testNotification.close(), 3000);
        } catch (error) {
          console.error('Test notification failed:', error);
          toast.error('Notification test failed. Check console for details.');
        }
      }, 500);
    } else if (permission === 'denied') {
      toast.error('Notification permission denied. Please enable it in your iPhone settings.');
    }
  };

  const checkNotificationStatus = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = (window.navigator as any).standalone || 
      window.matchMedia('(display-mode: standalone)').matches;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasNotification = 'Notification' in window;
    const permission = hasNotification ? Notification.permission : 'not supported';
    
    const status = {
      isIOS,
      isStandalone,
      hasServiceWorker,
      hasNotification,
      permission,
      userAgent: navigator.userAgent,
    };
    
    console.log('Notification Status:', status);
    toast.success('Check console for notification status details');
    
    return status;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Hide notification permission buttons in mobile app (Capacitor) */}
          {!isMobileApp && notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                notificationPermission === 'denied'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {notificationPermission === 'denied' 
                ? '⚠️ Enable Notifications' 
                : '🔔 Enable Notifications'}
            </button>
          )}
          {!isMobileApp && notificationPermission === 'granted' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Notifications Enabled
            </div>
          )}
          {!isMobileApp && !isStandalone && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-xs">
              ⚠️ Add to Home Screen for notifications
            </div>
          )}
          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead(notifications.filter((n) => !n.read).map((n) => n._id))}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Mark All Read
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={async () => {
                const confirmed = confirm(
                  '⚠️ WARNING: This will permanently delete ALL notifications from the database!\n\n' +
                  'This action cannot be undone. Are you absolutely sure?'
                );
                
                if (!confirmed) return;

                const doubleConfirm = confirm(
                  'Are you REALLY sure? This will delete EVERY notification in the database permanently!'
                );
                
                if (!doubleConfirm) return;

                setDeletingAll(true);
                try {
                  const response = await fetch(apiUrl('/api/notifications/delete-all'), {
                    method: 'DELETE',
                    credentials: 'include',
                  });

                  if (response.ok) {
                    const data = await response.json();
                    toast.success(data.message || 'All notifications deleted successfully');
                    fetchNotifications(); // Refresh the list
                  } else {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to delete notifications' }));
                    toast.error(errorData.error || 'Failed to delete all notifications');
                  }
                } catch (error) {
                  console.error('Error deleting all notifications:', error);
                  toast.error('An error occurred while deleting notifications');
                } finally {
                  setDeletingAll(false);
                }
              }}
              disabled={deletingAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingAll ? 'Deleting...' : 'Delete All Notifications'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 transition-colors ${
                  notification.read
                    ? notification.title === 'TOP UP'
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-white'
                    : notification.title === 'TOP UP'
                    ? 'border-red-300 bg-red-50'
                    : 'border-primary-200 bg-primary-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${notification.title === 'TOP UP' ? 'text-red-600 text-lg' : 'text-gray-900'}`}>
                      {notification.title === 'TOP UP' && '🔔 '}
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                    
                    {/* Show shift details for operators */}
                    {user?.role === 'operator' && notification.shiftDetails && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            📍 {notification.shiftDetails.apartmentName}
                          </p>
                          {notification.shiftDetails.apartmentAddress && (
                            <p className="text-xs text-gray-600">{notification.shiftDetails.apartmentAddress}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            📅 {format(new Date(notification.shiftDetails.scheduledDate), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-xs text-gray-600">
                            🕐 {format(new Date(notification.shiftDetails.scheduledStartTime), 'h:mm a')}
                            {notification.shiftDetails.scheduledEndTime && 
                              ` - ${format(new Date(notification.shiftDetails.scheduledEndTime), 'h:mm a')}`
                            }
                          </p>
                          {notification.timeChangeDetails && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs font-medium text-yellow-900">Time Change Request:</p>
                              <p className="text-xs text-yellow-800">
                                New time: {format(new Date(notification.timeChangeDetails.newStartTime), 'h:mm a')}
                              </p>
                              {notification.timeChangeDetails.reason && (
                                <p className="text-xs text-yellow-800">Reason: {notification.timeChangeDetails.reason}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(notification.createdAt), 'dd/MM/yyyy, h:mm a')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-3 h-3 bg-primary-600 rounded-full ml-4"></div>
                  )}
                </div>
                {notification.relatedShift && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {user?.role === 'operator' && 
                     notification.type === 'shift_assigned' && 
                     !notification.shiftDetails?.confirmed && (
                      <button
                        onClick={async () => {
                          const shiftId = typeof notification.relatedShift === 'string' 
                            ? notification.relatedShift 
                            : String(notification.relatedShift);
                          const notificationId = notification._id;
                          try {
                            const response = await fetch(apiUrl(`/api/shifts/${shiftId}/confirm`), {
                              method: 'POST',
                              credentials: 'include',
                            });

                            if (response.ok) {
                              toast.success('Shift confirmed!');
                              // Mark notification as read and refresh
                              await markAsRead([notificationId]);
                              fetchNotifications(); // This will refresh and hide the button
                            } else {
                              const data = await response.json();
                              toast.error(data.error || 'Failed to confirm shift');
                              console.error('Confirm shift error:', data);
                            }
                          } catch (error: any) {
                            toast.error(error.message || 'An error occurred');
                            console.error('Confirm shift exception:', error);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        I Saw This Shift
                      </button>
                    )}
                    {user?.role === 'operator' && 
                     notification.type === 'time_change_requested_by_admin' && 
                     !notification.timeChangeDetails?.operatorConfirmed && (
                      <>
                        <button
                          onClick={async () => {
                            const shiftId = typeof notification.relatedShift === 'string' 
                              ? notification.relatedShift 
                              : String(notification.relatedShift);
                            const notificationId = notification._id;
                            try {
                              const response = await fetch(apiUrl(`/api/shifts/${shiftId}/time-change/confirm`), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ confirmed: true }),
                              });

                              if (response.ok) {
                                toast.success('Time change confirmed!');
                                await markAsRead([notificationId]);
                                fetchNotifications();
                              } else {
                                const data = await response.json();
                                toast.error(data.error || 'Failed to confirm time change');
                              }
                            } catch (error: any) {
                              toast.error(error.message || 'An error occurred');
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirm Time Change
                        </button>
                        <button
                          onClick={async () => {
                            const shiftId = typeof notification.relatedShift === 'string' 
                              ? notification.relatedShift 
                              : String(notification.relatedShift);
                            const notificationId = notification._id;
                            try {
                              const response = await fetch(apiUrl(`/api/shifts/${shiftId}/time-change/confirm`), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ confirmed: false }),
                              });

                              if (response.ok) {
                                toast.success('Time change rejected');
                                await markAsRead([notificationId]);
                                fetchNotifications();
                              } else {
                                const data = await response.json();
                                toast.error(data.error || 'Failed to reject time change');
                              }
                            } catch (error: any) {
                              toast.error(error.message || 'An error occurred');
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject Time Change
                        </button>
                      </>
                    )}
                    {notification.shiftDetails?.confirmed && (
                      <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Confirmed
                      </span>
                    )}
                    {notification.timeChangeDetails?.operatorConfirmed && (
                      <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Time Change Confirmed
                      </span>
                    )}
                    {notification.type !== 'shift_deleted' && notification.relatedShift && (
                      <button
                        onClick={async () => {
                          markAsRead([notification._id]);
                          const shiftId = typeof notification.relatedShift === 'string' 
                            ? notification.relatedShift 
                            : String(notification.relatedShift);
                          
                          // Check if shift still exists before navigating
                          try {
                            const response = await fetch(apiUrl(`/api/shifts/${shiftId}`), {
                              credentials: 'include',
                            });
                            if (response.ok) {
                              router.push(`/dashboard/shifts/details?id=${shiftId}`);
                            } else {
                              toast.error('This shift has been deleted');
                            }
                          } catch (error) {
                            toast.error('This shift has been deleted');
                          }
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Shift →
                      </button>
                    )}
                    {notification.type === 'shift_deleted' && (
                      <p className="text-sm text-gray-500 italic">
                        This shift has been deleted and is no longer available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

