import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let isValidUser = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      await jwtVerify(token, secret);
      isValidUser = true;
    } catch {
      isValidUser = false;
    }
  }

  // 1. If authenticated user tries to visit /auth, redirect to /regular-season
  if (isValidUser && pathname === '/auth') {
    return NextResponse.redirect(new URL('/regular-season', request.url));
  }

  // 2. Allow public routes
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/auth' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/logos') ||
    pathname === '/favicon.ico';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. If unauthenticated user tries to visit protected routes, redirect to Landing Page (/)
  if (!isValidUser) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
