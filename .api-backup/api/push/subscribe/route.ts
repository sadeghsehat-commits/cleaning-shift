import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });
    
    if (existing) {
      // Update existing subscription
      existing.user = user._id;
      existing.keys = subscription.keys;
      await existing.save();
      return NextResponse.json({ message: 'Subscription updated' });
    }

    // Create new subscription
    await PushSubscription.create({
      user: user._id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    return NextResponse.json({ message: 'Subscription saved' });
  } catch (error: any) {
    console.error('Push subscription error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await PushSubscription.deleteOne({ user: user._id, endpoint });

    return NextResponse.json({ message: 'Subscription removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove subscription' }, { status: 500 });
  }
}





