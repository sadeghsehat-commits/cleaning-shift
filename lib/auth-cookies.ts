import { NextRequest } from 'next/server';

/**
 * Use sameSite: 'lax' when the request is from our web app (any Vercel deployment).
 * Use sameSite: 'none' only for cross-origin (e.g. mobile app: localhost, capacitor).
 * Fixes login on preview URLs (e.g. cleaning-shift-manager-git-main-...vercel.app).
 */
export function isSameOriginWeb(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin request
  try {
    const u = new URL(origin);
    const h = u.hostname.toLowerCase();
    if (h.endsWith('.vercel.app') || h.includes('cleaning-shift-manager')) return true;
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
