import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
} as const;

function corsAllowOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  const ua = request.headers.get('user-agent') || '';
  const allowed = [
    'https://localhost',
    'http://localhost',
    'capacitor://localhost',
    'file://',
  ];
  const isMobile = /android|webview|wv|capacitor/i.test(ua);
  const isAllowed =
    !origin ||
    origin === 'null' ||
    allowed.some((a) => origin?.includes(a)) ||
    origin?.includes('vercel.app') ||
    origin?.includes('cleaning-shift-manager');
  if (!isAllowed) return null;
  if (origin && origin !== 'null') return origin;
  if (isMobile || !origin || origin === 'null') return 'https://localhost';
  return null;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const allowOrigin = corsAllowOrigin(request);
  const headers = new Headers();
  if (allowOrigin) {
    headers.set('Access-Control-Allow-Origin', allowOrigin);
  }
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    headers.set(k, v);
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  const res = NextResponse.next();
  headers.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: '/api/:path*',
};

