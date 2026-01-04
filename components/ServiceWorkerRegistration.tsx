'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
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

