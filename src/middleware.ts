import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const url = request.nextUrl.clone();

  // List of protected routes
  const protectedPaths = ['/user-listing', '/subscription', '/home'];

  // If trying to access a protected route without a token, redirect to login page
  if (protectedPaths.some(path => url.pathname.startsWith(path)) && !token) {
    url.pathname = '/'; // redirect to login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user-listing', '/subscription', '/home'],
};
