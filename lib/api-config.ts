/**
 * API Configuration for mobile apps
 * In mobile apps (Capacitor), API calls should go to the remote server
 * In web apps, API calls can be relative
 */

// Check if we're running in Capacitor (mobile app)
export const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;

// Get the API base URL
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use relative URLs
    return '';
  }

  // In Capacitor (mobile app), use the remote server URL
  if (isCapacitor) {
    // Try to get from environment variable first
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl !== 'https://your-app.vercel.app') {
      return envUrl;
    }
    
    // Fallback: try to detect from current location (for web builds)
    // In mobile app, window.location.origin won't work, so we need env var
    // For now, return empty string and log warning
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set! Mobile app needs this to work.');
    console.warn('Set NEXT_PUBLIC_API_URL=https://your-app.vercel.app in .env.local');
    return envUrl || '';
  }

  // In web browser, use relative URLs (same origin)
  return '';
};

export const apiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from path if baseUrl already ends with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};


