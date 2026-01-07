'use client';

import { useEffect } from 'react';

// Check if we're in a mobile app (Capacitor)
const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor
  if ((window as any).Capacitor !== undefined) return true;
  
  // Check if we're in a WebView or localhost (mobile app)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '' ||
                      window.location.hostname === '127.0.0.1';
  const isCapacitorProtocol = window.location.protocol === 'capacitor:' || 
                               window.location.protocol === 'file:';
  
  return isLocalhost || isCapacitorProtocol || /wv|WebView/i.test(navigator.userAgent);
};

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // DISABLE Service Worker for mobile apps - it causes infinite request loops
    if (isMobileApp()) {
      console.log('📱 Mobile app detected - Service Worker DISABLED to prevent infinite loops');
      
      // Unregister any existing service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            console.log('🗑️ Unregistering service worker for mobile app');
            registration.unregister();
          });
        });
      }
      return; // Exit early - don't register SW in mobile apps
    }

    // Only register Service Worker in web browsers
    if ('serviceWorker' in navigator) {
      // First, unregister any existing service workers to clear old cache
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });

      window.addEventListener('load', () => {
        // Small delay to ensure unregister completes
        setTimeout(() => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('SW registered: ', registration);

              // Force update on registration
              registration.update();

              // Check for updates every hour
              setInterval(() => {
                registration.update();
              }, 60 * 60 * 1000); // 1 hour

              // Also check for updates when the page becomes visible again
              document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                  registration.update();
                }
              });
            })
            .catch((registrationError) => {
              console.log('SW registration failed: ', registrationError);
            });
        }, 100);
      });
    }
  }, []);

  return null;
}

