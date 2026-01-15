'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PushNotificationManager from '@/components/PushNotificationManager';
import CapacitorPushNotifications from '@/components/CapacitorPushNotifications';
import LanguageSelector from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', user ? { id: user.id, role: user.role, name: user.name } : 'null');
    if (user) {
      console.log('🎯 USER EXISTS - Should render push notifications for role:', user.role);
      console.log('🎯 Condition check:', {
        hasUser: !!user,
        isOperator: user.role === 'operator',
        isAdmin: user.role === 'admin',
        isOwner: user.role === 'owner',
        shouldRender: user.role === 'operator' || user.role === 'admin' || user.role === 'owner'
      });
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth successful, setting user:', data.user);
        setUser(data.user);
      } else {
        console.log('❌ Auth failed, redirecting to login');
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout clicked');
      
      // ⛔ Set logout flag FIRST to prevent auto-re-login
      sessionStorage.setItem('logged_out', 'true');
      console.log('✅ Set logged_out flag');
      
      // Call logout API to clear server-side cookie
      const response = await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
      console.log('📡 Logout response:', response.status);
      
      // Clear all local storage and session storage (but keep logged_out flag)
      localStorage.clear();
      
      // Clear all cookies (client-side) - try multiple domains
      const domains = ['', 'localhost', '.localhost', window.location.hostname];
      const paths = ['/', ''];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}`;
          document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; secure`;
          document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ''}; secure; samesite=none`;
        });
      });
      
      // Clear all cookies generically
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
      
      console.log('✅ Cleared local storage and cookies');
      
      // Set user to null immediately
      setUser(null);
      
      // For mobile app, clear WebView cookies using Capacitor
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
          console.log('📱 Mobile app detected, clearing WebView cookies...');
          
          // Clear caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Cleared caches');
          }
          
          // For Android, we need to clear cookies via WebView
          // Since Capacitor doesn't have a direct cookie plugin,
          // we'll clear via the bridge
          if (Capacitor.getPlatform() === 'android' && (window as any).CapacitorWeb) {
            try {
              // Access Android WebView cookie manager
              const webView = (window as any).CapacitorWeb?.getWebView?.();
              if (webView) {
                const cookieManager = (window as any).android?.webkit?.CookieManager;
                if (cookieManager) {
                  cookieManager.getInstance().removeAllCookies(null);
                  console.log('✅ Cleared Android WebView cookies');
                }
              }
            } catch (e) {
              console.log('⚠️ Could not access Android cookie manager:', e);
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Could not clear mobile cookies:', e);
      }
      
      // Force full page reload to login page
      console.log('✅ Redirecting to login page...');
      
      // Use a small delay to ensure cookies are cleared
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if API fails, set logout flag and redirect
      sessionStorage.setItem('logged_out', 'true');
      localStorage.clear();
      setUser(null);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  // Debug logging at component render
  console.log('🎯 DashboardLayout rendering, user:', user ? { id: user.id, role: user.role, name: user.name } : 'No user');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Cleaning Manager</h1>
          <div className="flex items-center gap-3">
            <div className="w-32">
              <LanguageSelector />
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-900"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {showMenu && (
          <nav className="border-t border-gray-200 p-4 space-y-2">
            <NavLinks user={user} isActive={isActive} onLinkClick={() => setShowMenu(false)} />
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-4 py-2">
                <div className="text-sm text-gray-700 font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize mt-1">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                {t.nav.logout}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-gray-900">Cleaning Manager</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <NavLinks user={user} isActive={isActive} />
              </nav>
            </div>
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Language</label>
                <LanguageSelector />
              </div>
              <div className="text-sm text-gray-600 mb-2">{user.name}</div>
              <div className="text-xs text-gray-500 mb-4 capitalize">{user.role}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
      
      {/* Push Notification Managers */}
      {/* Web Push for browsers (works when app is open) */}
      {user && (user.role === 'operator' || user.role === 'admin' || user.role === 'owner') && <PushNotificationManager />}
      {/* Capacitor Push for native apps (works even when app is closed) */}
      {(() => {
        console.log('🔍 PUSH NOTIFICATION RENDER CHECK - User:', user ? { role: user.role, id: user.id } : 'NO USER');
        const shouldRender = user && (user.role === 'operator' || user.role === 'admin' || user.role === 'owner');
        console.log('🔍 PUSH NOTIFICATION RENDER CHECK - Should render:', shouldRender);
        
        if (shouldRender) {
          console.log('✅✅✅ RENDERING CapacitorPushNotifications for role:', user!.role, 'user id:', user!.id);
          return <CapacitorPushNotifications key={`push-${user!.id}-${user!.role}`} />;
        } else {
          console.log('❌❌❌ NOT rendering CapacitorPushNotifications. User:', user ? { role: user.role, id: user.id } : 'null');
          return null;
        }
      })()}
    </div>
  );
}

function NavLinks({ user, isActive, onLinkClick }: { user: User; isActive: (path: string) => boolean; onLinkClick?: () => void }) {
  const { t } = useI18n();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(apiUrl('/api/notifications'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const unread = data.notifications?.filter((n: any) => !n.read) || [];
        setUnreadCount(unread.length);
      }
    } catch (error) {
      // Silently fail - don't show error for background polling
    }
  };

  const links = [
    { href: '/dashboard', label: t.nav.home, icon: 'home', roles: ['admin', 'operator', 'owner', 'viewer'] },
    { href: '/dashboard/shifts', label: t.nav.shifts, roles: ['admin', 'operator', 'owner', 'viewer'] },
    { href: '/dashboard/schedule', label: t.nav.schedule, icon: 'schedule', roles: ['admin', 'operator', 'owner'] },
    { href: '/dashboard/apartments', label: t.nav.apartments, roles: ['admin', 'owner', 'viewer'] },
    { href: '/dashboard/cleaning-calendar', label: t.nav.calendar, roles: ['owner', 'viewer'] },
    { href: '/dashboard/unavailability', label: 'Unavailability', roles: ['operator'] },
    { href: '/dashboard/unavailability-requests', label: 'Unavailability Requests', roles: ['admin'] },
    { href: '/dashboard/users', label: t.nav.users, roles: ['admin'] },
    { href: '/dashboard/reports', label: t.nav.reports, roles: ['admin'] },
    { href: '/dashboard/reports/operator-work-days', label: 'Operator Work Days', roles: ['admin'] },
    { href: '/dashboard/notifications', label: t.nav.notifications, roles: ['admin', 'operator', 'owner', 'viewer'], showBadge: true },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <>
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={`block px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
            isActive(link.href)
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            {link.href === '/dashboard' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}
            {link.href === '/dashboard/notifications' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            )}
            {link.label}
          </div>
          {link.showBadge && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      ))}
    </>
  );
}

