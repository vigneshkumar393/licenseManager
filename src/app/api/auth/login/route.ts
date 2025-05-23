import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import User from '../../../../../models/User';

export async function POST(request: Request) {
  await connectDB();

  const { username, email, password } = await request.json();

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user || user.password !== password) {
    return NextResponse.json(
      { success: false, message: 'Invalid username/email or password' },
      { status: 401 }
    );
  }

  // Here you would create a real token (JWT), but for demo, simple string token
  const token = 'dummy-auth-token';

  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
  });

  // Set cookie for authentication
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return response;
}
