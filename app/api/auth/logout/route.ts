import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@/lib/auth-cookies';

export async function POST(request: NextRequest) {
  const opts = getAuthCookieOptions(request);
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.set('token', '', {
    ...opts,
    maxAge: 0,
  });
  return response;
}
