import { NextRequest, NextResponse } from 'next/server';
import { isSameOriginWeb } from '@/lib/auth-cookies';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  const origin = request.headers.get('origin');
  const sameOrigin = isSameOriginWeb(request);

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: sameOrigin ? 'lax' : 'none',
    maxAge: 0,
    path: '/',
  });
  response.cookies.delete('token');
  
  // Add CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  console.log('🚪 Logout: Cookie deleted for origin:', origin);
  
  return response;
}

