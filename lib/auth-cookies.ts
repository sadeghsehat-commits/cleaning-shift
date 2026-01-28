import { NextRequest } from 'next/server';

/**
 * CORS Allow-Origin for API routes called from Android (origin https://localhost).
 * Use request origin when valid; else 'https://localhost' for mobile User-Agent.
 */
export function corsAllowOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  const ua = request.headers.get('user-agent') || '';
  const mobile = /android|webview|wv|capacitor/i.test(ua);
  if (origin && origin !== 'null') return origin;
  if (mobile) return 'https://localhost';
  return null;
}

/**
 * Use sameSite: 'lax' when the request is from our web app (any Vercel deployment).
 * Use sameSite: 'none' only for cross-origin (e.g. mobile app: localhost, capacitor).
 * Fixes login on preview URLs (e.g. cleaning-shift-manager-git-main-...vercel.app).
 */
export function isSameOriginWeb(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin request
  if (/^capacitor:\/\//i.test(origin) || /^file:\/\//i.test(origin)) return false;
  try {
    const u = new URL(origin);
    const h = u.hostname.toLowerCase();
    if (h.endsWith('.vercel.app') || h.includes('cleaning-shift-manager')) return true;
    if (h === 'localhost' || h === '127.0.0.1') return false;
    return false;
  } catch {
    return false;
  }
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/' as const,
};

export type SameSite = 'lax' | 'none';

/**
 * Cookie options for auth token. Use sameSite: 'none' + secure for mobile
 * (cross-origin) so the cookie is sent with requests from capacitor://localhost
 * or https://localhost to the API.
 */
export function getAuthCookieOptions(request: NextRequest): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: SameSite;
  maxAge: number;
  path: '/';
} {
  const sameOrigin = isSameOriginWeb(request);
  return {
    ...AUTH_COOKIE_OPTIONS,
    sameSite: sameOrigin ? 'lax' : 'none',
    secure: true, // required when sameSite is 'none'
  };
}
