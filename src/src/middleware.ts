import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  let token = null;
  try {
    token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET || "bajapro_secret_key_123" 
    });
  } catch (error) {
    console.error("Error in NextAuth middleware:", error);
  }
  
  // Jika getToken gagal (terkadang terjadi jika environment kacau), gunakan fallback pengecekan cookie
  const sessionCookie = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

  let user = token;
  
  // Jika user null tapi sebenarnya TIDAK ada cookie sama sekali, pastikan diblokir
  if (!user && !sessionCookie) {
    user = null;
  }

  const { pathname } = request.nextUrl;
  
  let response = NextResponse.next();

  // Proteksi rute Dashboard & Master (Hanya untuk Admin & Pengajar)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?', request.url));
    }
    // Siswa (3) tidak boleh masuk ke rute admin/pengajar
    if (user.role_id == 3) {
      return NextResponse.redirect(new URL('/home?', request.url));
    }
    // Pengajar (2) harus disetujui admin
    if (user.role_id == 2 && user.is_approved_by_admin == 0) {
      return NextResponse.redirect(new URL('/waiting-approval?', request.url));
    }
  } 
  
  // Proteksi rute Student/Home
  else if (pathname.startsWith('/home') || pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?', request.url));
    }
    // Admin/Pengajar diarahkan ke dashboard utama jika nyasar ke home siswa
    if (user.role_id == 1 || user.role_id == 2) {
      return NextResponse.redirect(new URL('/dashboard?', request.url));
    }
  } 
  
  // Redirect user yang sudah login
  else if (pathname === '/login' || pathname === '/register') {
    if (user) {
      if (user.role_id == 3) return NextResponse.redirect(new URL('/home', request.url));
      else if (user.role_id == 2 && user.is_approved_by_admin == 0) return NextResponse.redirect(new URL('/waiting-approval', request.url));
      else return NextResponse.redirect(new URL('/dashboard', request.url));
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|logo).*)'],
};