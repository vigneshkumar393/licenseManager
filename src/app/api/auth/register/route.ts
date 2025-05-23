import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import User from '../../../../../models/User';

export async function POST(request: Request) {
  await connectDB();
  const { username, password, email } = await request.json();

  // Check if username or email already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return NextResponse.json(
      { success: false, message: 'Username or email already taken' },
      { status: 400 }
    );
  }

  const user = new User({ username, password, email });
  await user.save();

  return NextResponse.json({ success: true, message: 'User registered successfully' });
}
