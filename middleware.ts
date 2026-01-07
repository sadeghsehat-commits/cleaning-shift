import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    // Allow requests from mobile apps (localhost, capacitor://, file://)
    const allowedOrigins = [
      'https://localhost',
      'http://localhost',
      'capacitor://localhost',
      'file://',
    ];
    
    // Also allow from the Vercel domain (for web)
    const isAllowedOrigin = 
      !origin || // No origin (same-origin request)
      allowedOrigins.some(allowed => origin.includes(allowed)) ||
      origin.includes('vercel.app') ||
      origin.includes('cleaning-shift-manager');

    const response = NextResponse.next();
    
    if (isAllowedOrigin && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Same-origin request
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

