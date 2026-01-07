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
    // ⛔ MOST IMPORTANT: Skip auth check if user just logged out
    if (sessionStorage.getItem('logged_out') === 'true') {
      console.log('⛔ Skipping auth check after logout');
      setLoading(false);
      return;
    }

    // Prevent infinite loops - check if already checking
    if ((window as any).__checkingAuth) {
      console.log('⚠️ Auth check already in progress, skipping...');
      return;
    }
    (window as any).__checkingAuth = true;

    // Debug logging
    console.log('🔍 checkAuth called');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current pathname:', window.location.pathname);
    const apiEndpoint = apiUrl('/api/auth/me');
    console.log('🔍 API URL will be:', apiEndpoint);
    
    // Set a timeout to ensure loading state is cleared even if request hangs
    const safetyTimeout = setTimeout(() => {
      console.log('⏱️ Safety timeout reached - clearing loading');
      setLoading(false);
      (window as any).__checkingAuth = false;
    }, 5000); // Safety timeout: always clear loading after 5 seconds

    try {
      console.log('🌐 Fetching from:', apiEndpoint);
      
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => {
        console.log('⏱️ Fetch timeout - aborting');
        controller.abort();
      }, 4000); // Abort fetch after 4 seconds
      
      const response = await fetch(apiEndpoint, {
        signal: controller.signal,
        credentials: 'include', // CRITICAL: Required for cookies to work in mobile app
      });
      
      clearTimeout(fetchTimeout);
      clearTimeout(safetyTimeout);
      
      console.log('✅ Response received:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        // Clear logout flag on successful auth (user logged in again)
        sessionStorage.removeItem('logged_out');
        console.log('✅ Auth successful, redirecting to dashboard');
        (window as any).__checkingAuth = false;
        // Only redirect if we're on the home page
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        console.log('❌ Auth failed:', response.status);
        (window as any).__checkingAuth = false;
        setLoading(false);
      }
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('❌ Error in checkAuth:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      // Not authenticated or request failed/timeout
      (window as any).__checkingAuth = false;
      setLoading(false);
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

