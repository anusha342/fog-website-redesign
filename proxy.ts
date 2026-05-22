import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Routes inside /admin that do NOT require an active session
const PUBLIC_ADMIN_PATHS = ['/admin', '/admin/verify'];
const PUBLIC_API_PATHS   = ['/api/admin/send-otp', '/api/admin/verify-otp'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi  = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  // Allow the public login routes through without a session
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/admin', req.url));
    res.cookies.delete('admin_token');
    return res;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
