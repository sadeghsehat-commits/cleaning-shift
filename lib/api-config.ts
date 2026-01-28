/**
 * API Configuration for mobile apps
 * In mobile apps (Capacitor), API calls should go to the remote server
 * In web apps, API calls can be relative
 */

const MOBILE_API_URL = 'https://cleaning-shift-manager.vercel.app';
/** Preview fallback when production is unreachable from Android (e.g. network/config). */
export const MOBILE_API_URL_FALLBACK = 'https://cleaning-shift-manager-git-main-sadegh-sehats-projects.vercel.app';
export const API_OVERRIDE_KEY = 'apiBaseUrlOverride';

// Check if we're running in Capacitor (mobile app)
// Multiple detection methods for better reliability
export const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Method 1: Check for Capacitor object
  if ((window as any).Capacitor !== undefined) {
    return true;
  }
  
  // Method 2: Check for Capacitor plugins
  if ((window as any).CapacitorPlugins !== undefined) {
    return true;
  }
  
  // Method 3: Check user agent (Android/iOS)
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (/android/i.test(ua) || /iPad|iPhone|iPod/.test(ua)) {
    // Additional check: if we're in a file:// protocol or capacitor://, it's mobile
    if (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') {
      return true;
    }
    // If we're in an Android WebView (common in Capacitor apps)
    if (window.location.hostname === '' || window.location.hostname === 'localhost') {
      return true;
    }
  }
  
  return false;
};

// Get the API base URL
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use relative URLs
    return '';
  }

  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '' || 
      window.location.hostname === '127.0.0.1') {
    try {
      const over = sessionStorage?.getItem(API_OVERRIDE_KEY);
      if (over) {
        console.log('📱 Using API override (fallback):', over);
        return over;
      }
    } catch {}
    console.log('📱 LOCALHOST DETECTED - This is a mobile app!');
    console.log('✅ Using remote API URL:', MOBILE_API_URL);
    return MOBILE_API_URL;
  }

  // FORCE remote URL for mobile apps - more reliable detection
  const isMobile = isCapacitor();
  const isStaticBuild = window.location.protocol === 'file:' || 
                        window.location.protocol === 'capacitor:' ||
                        (window.location.hostname === '' && window.location.protocol !== 'http:' && window.location.protocol !== 'https:');
  
  // Check if we're in a WebView (Android/iOS app)
  const isWebView = /wv|WebView/i.test(navigator.userAgent);
  
  // Use remote URL if ANY of these conditions are true
  if (isMobile || isStaticBuild || isWebView) {
    try {
      const over = sessionStorage?.getItem(API_OVERRIDE_KEY);
      if (over) {
        console.log('📱 Using API override (fallback):', over);
        return over;
      }
    } catch {}
    console.log('📱 Mobile app detected! Using remote API URL:', MOBILE_API_URL);
    return MOBILE_API_URL;
  }

  // In web browser (development or production web), use relative URLs (same origin)
  // Only use relative URLs if we're clearly in a web browser with a real domain
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1' &&
        window.location.hostname.includes('.')) {
      // Production web - use relative URLs
      console.log('🌐 Web browser detected, using relative URLs');
      return '';
    }
  }

  try {
    const over = sessionStorage?.getItem(API_OVERRIDE_KEY);
    if (over) return over;
  } catch {}
  console.log('⚠️ Unknown environment, using remote API URL for safety:', MOBILE_API_URL);
  return MOBILE_API_URL;
};

export const apiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from path if baseUrl already ends with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Shift details URL: always use /shifts/details?id=... (same as Android).
 * The [id] route had different behavior; details page is the single source of truth.
 */
export const getShiftDetailsUrl = (shiftId: string): string => {
  return `/dashboard/shifts/details?id=${shiftId}`;
};

/**
 * Get the correct shift edit URL based on whether we're in a mobile app or web browser
 */
export const getShiftEditUrl = (shiftId: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: use dynamic route (web)
    return `/dashboard/shifts/${shiftId}/edit`;
  }

  // Check if we're in a mobile app
  const isMobile = isCapacitor() || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.protocol === 'file:' ||
                   window.location.protocol === 'capacitor:';

  if (isMobile) {
    // Mobile: don't support edit (static export doesn't support dynamic routes)
    // Return details page instead
    return `/dashboard/shifts/details?id=${shiftId}`;
  } else {
    // Web: use dynamic route
    return `/dashboard/shifts/${shiftId}/edit`;
  }
};

/**
 * Get the correct apartment edit URL based on whether we're in a mobile app or web browser
 * In mobile (Capacitor), use static route /apartments-id/edit?id=...
 * In web, use dynamic route /apartments/[id]/edit
 */
export const getApartmentEditUrl = (apartmentId: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: use dynamic route (web) if it exists, otherwise static
    return `/apartments-id/edit?id=${apartmentId}`;
  }

  // Check if we're in a mobile app
  const isMobile = isCapacitor() || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.protocol === 'file:' ||
                   window.location.protocol === 'capacitor:';

  if (isMobile) {
    // Mobile: use static route with query parameter
    return `/apartments-id/edit?id=${apartmentId}`;
  } else {
    // Web: try dynamic route first, fallback to static if not available
    return `/dashboard/apartments/${apartmentId}/edit`;
  }
};


