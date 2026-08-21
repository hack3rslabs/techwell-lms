import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user has an authentication token
  const token = request.cookies.get('token');

  // If trying to access /admin routes without a token
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      // Immediate server-side redirect to /login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes to save edge performance
export const config = {
  matcher: '/admin/:path*',
};
