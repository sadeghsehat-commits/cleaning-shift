/**
 * API Configuration for mobile apps
 * In mobile apps (Capacitor), API calls should go to the remote server
 * In web apps, API calls can be relative
 */

// API URL for mobile app - MUST be set correctly
const MOBILE_API_URL = 'https://cleaning-shift-manager.vercel.app';

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
    // Use hardcoded URL for mobile (more reliable than env var in static build)
    const apiUrl = MOBILE_API_URL;
    console.log('📱 Mobile app detected, using API URL:', apiUrl);
    return apiUrl;
  }

  // Check if we're in a static build (out directory) - also use remote URL
  // This handles the case where the app is built statically but not in Capacitor
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    console.log('📱 Static build detected, using API URL:', MOBILE_API_URL);
    return MOBILE_API_URL;
  }

  // In web browser (development or production web), use relative URLs (same origin)
  return '';
};

export const apiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from path if baseUrl already ends with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};


