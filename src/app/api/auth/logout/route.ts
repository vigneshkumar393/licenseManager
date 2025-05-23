import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // This removes the cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return response;
}
