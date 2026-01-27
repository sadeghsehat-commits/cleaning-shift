'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { apiUrl } from '@/lib/api-config';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // ⛔ Skip if we're on a dashboard route (e.g. opened from notification to /dashboard/shifts/details).
    // The dashboard layout handles auth. Hand off immediately so we don't show "Loading..." or login.
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    if (pathname.startsWith('/dashboard')) {
      console.log('⏩ Home: on /dashboard route, handing off to dashboard');
      router.replace(pathname + search);
      return;
    }

    // ⛔ MOST IMPORTANT: Skip auth check if user just logged out
    const loggedOutSession = sessionStorage.getItem('logged_out') === 'true';
    const loggedOutPersistent = localStorage.getItem('logged_out') === 'true';
    if (loggedOutSession || loggedOutPersistent) {
      console.log('⛔ Skipping auth check after logout');
      if (loggedOutPersistent) localStorage.removeItem('logged_out');
      setLoading(false);
      return;
    }

    if ((window as any).__checkingAuth) {
      console.log('⚠️ Auth check already in progress, skipping...');
      return;
    }
    (window as any).__checkingAuth = true;

    console.log('🔍 checkAuth called');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current pathname:', pathname);
    const apiEndpoint = apiUrl('/api/auth/me');
    
    // Set a timeout to ensure loading state is cleared even if request hangs
    const safetyTimeout = setTimeout(() => {
      console.log('⏱️ Safety timeout reached - clearing loading');
      setLoading(false);
      (window as any).__checkingAuth = false;
    }, 5000); // Safety timeout: always clear loading after 5 seconds

    const maxAttempts = 3;
    const retryDelayMs = 600;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🌐 Fetching from (attempt ${attempt}/${maxAttempts}):`, apiEndpoint);

        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => {
          console.log('⏱️ Fetch timeout - aborting');
          controller.abort();
        }, 4000);

        const response = await fetch(apiEndpoint, {
          signal: controller.signal,
          credentials: 'include',
        });

        clearTimeout(fetchTimeout);
        clearTimeout(safetyTimeout);

        console.log('✅ Response received:', response.status, response.statusText);

        if (response.ok) {
          clearTimeout(safetyTimeout);
          const data = await response.json();
          sessionStorage.removeItem('logged_out');
          localStorage.removeItem('logged_out');
          console.log('✅ Auth successful, auto-logged in as:', data.user ? { role: data.user.role, email: data.user.email, name: data.user.name } : 'unknown');
          (window as any).__checkingAuth = false;
          setLoading(false);
          const p = window.location.pathname;
          if (p === '/' || p === '/login') {
            router.push('/dashboard');
          } else if (p.startsWith('/dashboard')) {
            router.replace(p + (window.location.search || ''));
          }
          return;
        }

        console.log(`❌ Auth failed (attempt ${attempt}/${maxAttempts}):`, response.status);
        if (attempt < maxAttempts) {
          console.log(`🔄 Retrying in ${retryDelayMs}ms...`);
          await new Promise((r) => setTimeout(r, retryDelayMs));
        } else {
          (window as any).__checkingAuth = false;
          setLoading(false);
        }
      } catch (error: any) {
        clearTimeout(safetyTimeout);
        console.error(`❌ Error in checkAuth (attempt ${attempt}/${maxAttempts}):`, error?.message || error);
        if (attempt < maxAttempts) {
          console.log(`🔄 Retrying in ${retryDelayMs}ms...`);
          await new Promise((r) => setTimeout(r, retryDelayMs));
        } else {
          (window as any).__checkingAuth = false;
          setLoading(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eff6ff)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ color: '#111827' }}>Cleaning Shift Manager</h1>
          <p className="text-gray-600" style={{ color: '#4b5563' }}>Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

