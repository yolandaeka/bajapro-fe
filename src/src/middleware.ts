import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value;
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (e) {}
  }

  const { pathname } = request.nextUrl;

  // Protect Dashboard routes (Admin & Pengajar)
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/report') || 
    pathname.startsWith('/leaderboard') || 
    pathname.startsWith('/kelas') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/approval') ||
    pathname.startsWith('/course') ||
    pathname.startsWith('/level') ||
    pathname.startsWith('/code_question') ||
    pathname.startsWith('/roles') ||
    pathname.startsWith('/permission') ||
    pathname.startsWith('/badge')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Only Admin (1) and Pengajar (2) can access these
    if (user.role_id === 3) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    // Pengajar must be approved
    if (user.role_id === 2 && user.is_approved_by_admin === 0) {
      return NextResponse.redirect(new URL('/waiting-approval', request.url));
    }
  }

  // Protect Student routes
  if (pathname.startsWith('/home') || pathname.startsWith('/student/course')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role_id === 1 || user.role_id === 2) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect logged in users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      if (user.role_id === 3) return NextResponse.redirect(new URL('/home', request.url));
      if (user.role_id === 2 && user.is_approved_by_admin === 0) return NextResponse.redirect(new URL('/waiting-approval', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/student/:path*', 
    '/login', 
    '/register', 
    '/report/:path*', 
    '/leaderboard/:path*', 
    '/kelas/:path*',
    '/users/:path*',
    '/approval/:path*',
    '/course/:path*',
    '/level/:path*',
    '/code_question/:path*',
    '/roles/:path*',
    '/permission/:path*',
    '/badge/:path*'
  ],
};
