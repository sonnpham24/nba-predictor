import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let isValidUser = false;
  let isAdminUser = false;

  if (token) {
    try {
      if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-fallback-secret-key');
      const { payload } = await jwtVerify(token, secret);
      isValidUser = true;
      if (payload && payload.isAdmin === true) {
        isAdminUser = true;
      }
    } catch {
      isValidUser = false;
      isAdminUser = false;
    }
  }

  // 1. If user is already authenticated and visits /auth, redirect to /regular-season
  if (isValidUser && pathname === '/auth') {
    return NextResponse.redirect(new URL('/regular-season', request.url));
  }

  // 2. STRICT ADMIN PROTECTION: Protect /admin and /api/admin/* at the Middleware level
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    if (!isValidUser || !isAdminUser) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized. Admin rights required.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 3. Allow public static assets and auth APIs
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/auth' ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/cron/live-sync' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/logos') ||
    pathname === '/favicon.ico' ||
    pathname === '/buzzerbet-icon.svg' ||
    pathname === '/icon.svg' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Strict authentication check for all other protected app routes (/regular-season, /settings, /standings, /stats, /team, etc.)
  if (!isValidUser) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
