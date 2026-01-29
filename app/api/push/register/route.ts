import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PushToken from '@/models/PushToken';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET: Health/status check (e.g. from Capacitor push init). Returns { ok: true } if auth works.
 * POST: Register FCM (Android) or APNs (iOS) token. Called after successful native registration.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ ok: true, userId: String(user._id) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, platform } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const plat = platform === 'ios' || platform === 'android' ? platform : 'unknown';

    const existing = await PushToken.findOne({ token: token.trim() });
    if (existing) {
      existing.user = user._id;
      existing.platform = plat;
      await existing.save();
      return NextResponse.json({ message: 'Token updated' });
    }

    await PushToken.create({
      user: user._id,
      token: token.trim(),
      platform: plat,
    });

    return NextResponse.json({ message: 'Token registered' });
  } catch (error: any) {
    console.error('Push register error:', error);
    return NextResponse.json({ error: error.message || 'Failed to register token' }, { status: 500 });
  }
}
