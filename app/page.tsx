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
    // Set a timeout to ensure loading state is cleared even if request hangs
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // Safety timeout: always clear loading after 5 seconds

    try {
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 4000); // Abort fetch after 4 seconds
      
      const response = await fetch(apiUrl('/api/auth/me'), {
        signal: controller.signal,
      });
      
      clearTimeout(fetchTimeout);
      clearTimeout(safetyTimeout);
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      // Not authenticated or request failed/timeout
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

