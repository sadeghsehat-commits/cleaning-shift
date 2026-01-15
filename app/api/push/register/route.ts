import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import PushToken from '@/models/PushToken';

/**
 * POST /api/push/register
 * 
 * Registers a device's FCM/APNS token for receiving native push notifications.
 * This replaces the Web Push subscription API for mobile apps.
 * 
 * Body:
 * - token: FCM token (Android) or APNS token (iOS)
 * - platform: 'ios' or 'android'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Check if token already exists for this user
    let pushToken = await PushToken.findOne({ user: user._id, token });

    if (pushToken) {
      // Update existing token
      pushToken.platform = platform || 'unknown';
      pushToken.updatedAt = new Date();
      await pushToken.save();
      console.log('✅ Updated existing push token for user:', user._id, 'role:', user.role);
    } else {
      // Create new token
      pushToken = await PushToken.create({
        user: user._id,
        token,
        platform: platform || 'unknown',
      });
      console.log('✅ Created new push token for user:', user._id, 'role:', user.role);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Push token registered successfully',
      userRole: user.role,
      userId: user._id.toString(),
    });
  } catch (error: any) {
    console.error('❌ Error registering push token:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to register push token' 
    }, { status: 500 });
  }
}

/**
 * GET /api/push/register
 * 
 * Check if current user has registered push tokens (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pushTokens = await PushToken.find({ user: user._id });
    
    return NextResponse.json({ 
      userId: user._id.toString(),
      userRole: user.role,
      tokenCount: pushTokens.length,
      tokens: pushTokens.map(t => ({
        platform: t.platform,
        createdAt: t.createdAt,
        lastRegistered: t.lastRegistered,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error checking push tokens:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check push tokens' 
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/push/register
 * 
 * CORS preflight handler
 */
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

