import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // get the cookie value
  const url = request.nextUrl.clone();

  // Protect /user-listing route
  if (url.pathname === '/user-listing' && !token) {
    url.pathname = '/'; // redirect to home or login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user-listing'],
};
