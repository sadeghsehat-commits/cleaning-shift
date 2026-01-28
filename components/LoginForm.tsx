'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiUrl, MOBILE_API_URL_FALLBACK, API_OVERRIDE_KEY } from '@/lib/api-config';

export default function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [phone, setPhone] = useState('');
  const [rolePassword, setRolePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate role passwords (viewer doesn't need password)
        if (role !== 'viewer') {
          if (role === 'admin' && rolePassword !== '25Dicembre@2025') {
            toast.error('Invalid admin password');
            setLoading(false);
            return;
          }
          if (role === 'owner' && rolePassword !== '26Dicembre@2025') {
            toast.error('Invalid owner password');
            setLoading(false);
            return;
          }
          if (role === 'operator' && rolePassword !== '27Dicembre@2025') {
            toast.error('Invalid operator password');
            setLoading(false);
            return;
          }
        }
      }

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? { email, password, name, role, phone: phone || undefined, rolePassword }
        : { email, password };

      const base = apiUrl('/');
      const isRemote = typeof base === 'string' && base.startsWith('http');
      const tryFallback = isRemote && base !== MOBILE_API_URL_FALLBACK && !!MOBILE_API_URL_FALLBACK;
      const apiEndpoint = base ? `${base.replace(/\/$/, '')}${endpoint}` : endpoint;
      console.log('🔐 Login attempt:', { endpoint: apiEndpoint, email, isSignUp, tryFallback });

      let response: Response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });
      } catch (fetchErr: any) {
        if (tryFallback && fetchErr?.name === 'TypeError' && (fetchErr?.message || '').includes('fetch')) {
          const fallbackUrl = `${MOBILE_API_URL_FALLBACK.replace(/\/$/, '')}${endpoint}`;
          console.log('🔄 Retrying with fallback API:', fallbackUrl);
          toast.loading('Retrying with preview server…', { id: 'fallback' });
          try {
            response = await fetch(fallbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
              credentials: 'include',
            });
            toast.dismiss('fallback');
            if (response.ok) {
              try {
                sessionStorage.setItem(API_OVERRIDE_KEY, MOBILE_API_URL_FALLBACK);
              } catch {}
            }
          } catch (retryErr) {
            toast.dismiss('fallback');
            throw fetchErr;
          }
        } else {
          throw fetchErr;
        }
      }

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('📡 Response text (first 200 chars):', text.substring(0, 200));
      
      let data: any;
      try {
        if (text && contentType && contentType.includes('application/json')) {
          data = JSON.parse(text);
          console.log('📡 Response data:', data);
        } else {
          // Response is not JSON - might be HTML error page or empty
          console.error('❌ Response is not JSON. Content-Type:', contentType);
          console.error('❌ Response text:', text);
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
        }
      } catch (parseError: any) {
        console.error('❌ JSON parse error:', parseError);
        if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (response.status === 404) {
          toast.error('API endpoint not found. Please check your connection.');
        } else if (text) {
          toast.error(`Error: ${text.substring(0, 100)}`);
        } else {
          toast.error('Failed to parse server response. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (response.ok) {
        // Clear logout flag on successful login (both sessionStorage and localStorage)
        sessionStorage.removeItem('logged_out');
        localStorage.removeItem('logged_out');
        console.log('✅ Cleared logged_out flag from both sessionStorage and localStorage on successful login');
        toast.success(isSignUp ? 'Registration successful!' : 'Login successful!');
        router.push('/dashboard');
        router.refresh();
      } else {
        console.error('❌ Login failed:', data);
        toast.error(data.error || (isSignUp ? 'Registration failed' : 'Login failed'));
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show more specific error message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Cannot connect to server. Check your internet connection.');
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An error occurred. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
      <div className="flex gap-2 mb-6 border-b border-gray-200" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            !isSignUp
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={!isSignUp ? { color: '#0284c7', borderBottom: '2px solid #0284c7' } : { color: '#6b7280' }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            isSignUp
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={isSignUp ? { color: '#0284c7', borderBottom: '2px solid #0284c7' } : { color: '#6b7280' }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="John Doe"
                style={{ WebkitAppearance: 'none' }}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setRolePassword(''); // Clear role password when role changes
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="operator">Operator</option>
                <option value="admin">Administrator</option>
                <option value="owner">Owner</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
            </div>
            {role !== 'viewer' && (
            <div>
              <label htmlFor="rolePassword" className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'admin' ? 'Admin Password *' : role === 'owner' ? 'Owner Password *' : 'Operator Password *'}
              </label>
              <input
                id="rolePassword"
                type="password"
                value={rolePassword}
                onChange={(e) => setRolePassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder={role === 'admin' ? 'Enter admin password' : role === 'owner' ? 'Enter owner password' : 'Enter operator password'}
                style={{ WebkitAppearance: 'none', fontSize: '16px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {role === 'admin' 
                  ? 'Required password: 25Dicembre@2025'
                  : role === 'owner'
                  ? 'Required password: 26Dicembre@2025'
                  : 'Required password: 27Dicembre@2025'}
              </p>
            </div>
            )}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="+1234567890"
                style={{ WebkitAppearance: 'none', fontSize: '16px' }}
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            placeholder="your@email.com"
            style={{ 
              WebkitAppearance: 'none', 
              fontSize: '16px',
              padding: '0.5rem 1rem',
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#111827',
              minHeight: '44px',
              boxSizing: 'border-box'
            }}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            placeholder="••••••••"
            minLength={6}
            style={{ 
              WebkitAppearance: 'none', 
              fontSize: '16px',
              padding: '0.5rem 1rem',
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#111827',
              minHeight: '44px',
              boxSizing: 'border-box'
            }}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ 
            backgroundColor: '#0284c7', 
            color: '#ffffff',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            minHeight: '44px',
            width: '100%',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#0369a1';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#0284c7';
            }
          }}
        >
          {loading
            ? isSignUp
              ? 'Creating account...'
              : 'Signing in...'
            : isSignUp
            ? 'Sign Up'
            : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

