import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, name, role, phone, rolePassword } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!['admin', 'operator', 'owner', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate role passwords
    if (role === 'admin') {
      if (!rolePassword || rolePassword !== '25Dicembre@2025') {
        return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 });
      }
    } else if (role === 'owner') {
      if (!rolePassword || rolePassword !== '26Dicembre@2025') {
        return NextResponse.json({ error: 'Invalid owner password' }, { status: 403 });
      }
    } else if (role === 'operator') {
      if (!rolePassword || rolePassword !== '27Dicembre@2025') {
        return NextResponse.json({ error: 'Invalid operator password' }, { status: 403 });
      }
    } else if (role === 'viewer') {
      // Viewer doesn't need a password - they can only view
      // No password required for viewer role
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      phone,
    });

    const token = generateToken(user);

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}

