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
    // Replace with your actual production server URL
    return process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
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

