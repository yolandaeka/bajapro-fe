import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  // Jika mencoba buka dashboard tapi belum login (tidak ada role)
  if (pathname.startsWith('/dashboard') && !role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Proteksi rute Admin
  const adminPaths = ['/level', '/roles'];
  if (adminPaths.some(path => pathname.startsWith(path)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};