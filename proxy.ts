import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Admin paths that don't require a session
const OPEN_ADMIN_PATHS = ['/admin', '/admin/verify', '/admin/logout-confirm'];
const OPEN_API_PATHS   = ['/api/admin/send-otp', '/api/admin/verify-otp'];

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi  = pathname.startsWith('/api/admin');
  const isAnyApi    = pathname.startsWith('/api');

  // ── Admin pages: require valid session ─────────────────────────────────
  if (isAdminPage) {
    // Login, verify, and logout-confirm are open
    if (OPEN_ADMIN_PATHS.includes(pathname)) return NextResponse.next();

    const token = req.cookies.get('admin_token')?.value;
    if (!token || !(await verifyAdminToken(token))) {
      const res = NextResponse.redirect(new URL('/admin', req.url));
      if (token) res.cookies.delete('admin_token');
      return res;
    }
    return NextResponse.next();
  }

  // ── Admin API routes: require valid session ─────────────────────────────
  if (isAdminApi) {
    if (OPEN_API_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

    const token = req.cookies.get('admin_token')?.value;
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── All other API routes: always allow ─────────────────────────────────
  if (isAnyApi) return NextResponse.next();

  // ── Public pages: if admin is logged in, redirect to logout-confirm ─────
  const token = req.cookies.get('admin_token')?.value;
  if (token && (await verifyAdminToken(token))) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/logout-confirm';
    url.searchParams.set('redirect', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except static assets and files with extensions
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images/|uploads/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|otf|woff|woff2)$).*)',
  ],
};
