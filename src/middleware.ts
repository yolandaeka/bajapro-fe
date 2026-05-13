import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value;
  let user = null;

  if (userCookie) {
    try {
      const decoded = decodeURIComponent(userCookie).replace(/^"|"$/g, '');
      user = JSON.parse(decoded);
    } catch (e) {
      try {
        user = JSON.parse(userCookie.replace(/^"|"$/g, ''));
      } catch (e2) {}
    }
  }

  const { pathname } = request.nextUrl;
  
  let response = NextResponse.next();

  // Proteksi rute Dashboard & Master (Hanya untuk Admin & Pengajar)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?reason=no_user_on_protected', request.url));
    }
    // Siswa (3) tidak boleh masuk ke rute admin/pengajar
    if (user.role_id == 3) {
      return NextResponse.redirect(new URL('/home?reason=student_blocked', request.url));
    }
    // Pengajar (2) harus disetujui admin
    if (user.role_id == 2 && user.is_approved_by_admin == 0) {
      return NextResponse.redirect(new URL('/waiting-approval?reason=not_approved', request.url));
    }
  } 
  
  // Proteksi rute Student/Home
  else if (pathname.startsWith('/home') || pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?reason=no_user_on_home', request.url));
    }
    // Admin/Pengajar diarahkan ke dashboard utama jika nyasar ke home siswa
    if (user.role_id == 1 || user.role_id == 2) {
      return NextResponse.redirect(new URL('/dashboard?reason=admin_on_home', request.url));
    }
  } 
  
  // Redirect user yang sudah login
  else if (pathname === '/login' || pathname === '/register') {
    if (user) {
      if (user.role_id == 3) return NextResponse.redirect(new URL('/home?reason=already_in_student', request.url));
      else if (user.role_id == 2 && user.is_approved_by_admin == 0) return NextResponse.redirect(new URL('/waiting-approval?reason=already_in_unapproved', request.url));
      else return NextResponse.redirect(new URL('/dashboard?reason=already_in_admin', request.url));
    }
  }

  // Header Debug (Sekarang pasti muncul)
  response.headers.set('x-debug-user-found', user ? 'true' : 'false');
  response.headers.set('x-debug-pathname', pathname);
  
  return response;
}

const protectedRoutes = [
  '/dashboard',
  '/report',
  '/leaderboard',
  '/kelas',
  '/users',
  '/approval',
  '/course',
  '/level',
  '/code_question',
  '/roles',
  '/permission',
  '/badge'
];

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/dashboard',
    '/home/:path*',
    '/home',
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