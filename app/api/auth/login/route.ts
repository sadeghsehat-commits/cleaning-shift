import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { isSameOriginWeb, AUTH_COOKIE_OPTIONS } from '@/lib/auth-cookies';

function corsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  const ua = request.headers.get('user-agent') || '';
  const mobile = /android|webview|wv|capacitor/i.test(ua);
  if (origin && origin !== 'null') return origin;
  if (mobile) return 'https://localhost';
  return null;
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  const o = corsOrigin(request);
  if (o) response.headers.set('Access-Control-Allow-Origin', o);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const o = corsOrigin(request);
    const sameOrigin = isSameOriginWeb(request);
    response.cookies.set('token', token, {
      ...AUTH_COOKIE_OPTIONS,
      sameSite: sameOrigin ? 'lax' : 'none',
    });
    if (o) response.headers.set('Access-Control-Allow-Origin', o);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

