'use client'

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter, usePathname } from 'next/navigation';

/**
 * BackButtonHandler Component
 * 
 * Handles Android hardware back button to navigate back in app history
 * instead of exiting the app. Only exits if there's no history to go back to.
 */
export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only handle back button on native platforms (Android/iOS)
    const platform = Capacitor.getPlatform();
    if (platform !== 'android' && platform !== 'ios') {
      return;
    }

    console.log('📱 Setting up back button handler for', platform);

    // Listen for back button press
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      console.log('🔙 Back button pressed');
      console.log('📍 Current pathname:', pathname);

      // Check if we're on root pages that should exit app
      const isLoginPage = pathname === '/' || pathname === '/login';
      const isDashboard = pathname === '/dashboard';

      // If on login page, exit app (can't go back from login)
      if (isLoginPage) {
        console.log('📍 On login page, exiting app');
        App.exitApp();
        return;
      }

      // If on dashboard (main page after login), also exit app
      // This gives user a way to exit if they want
      if (isDashboard) {
        console.log('📍 On dashboard, exiting app');
        App.exitApp();
        return;
      }

      // For all other pages, try to go back
      console.log('⬅️ Navigating back in app');
      router.back();
      
      // Fallback: if router.back() doesn't work, navigate to dashboard
      setTimeout(() => {
        // Check if we're still on the same page after a short delay
        // If so, manually navigate to dashboard
        if (window.location.pathname === pathname) {
          console.log('⚠️ router.back() didn\'t work, navigating to dashboard');
          router.push('/dashboard');
        }
      }, 100);
    });

    // Cleanup listener on unmount
    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [router, pathname]);

  // This component doesn't render anything
  return null;
}

