import { NextRequest, NextResponse } from 'next/server';

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
  
  // For cross-origin requests (mobile app), use sameSite: 'none' and secure: true
  const origin = request.headers.get('origin');
  const isCrossOrigin = origin && !origin.includes('cleaning-shift-manager.vercel.app');
  
  // Delete cookie by setting it to empty with maxAge: 0
  // Must use same attributes as when it was set
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: isCrossOrigin ? 'none' : 'lax',
    maxAge: 0, // This deletes the cookie
    path: '/',
  });
  
  // Also try the delete method
  response.cookies.delete('token');
  
  // Add CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  console.log('🚪 Logout: Cookie deleted for origin:', origin);
  
  return response;
}

