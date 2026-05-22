import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(s);
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    // Read the OTP token from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const otpTokenMatch = cookieHeader.match(/(?:^|;\s*)otp_token=([^;]+)/);
    const otpToken = otpTokenMatch ? otpTokenMatch[1] : null;

    if (!otpToken) {
      return NextResponse.json(
        { error: 'OTP session expired. Please request a new OTP.' },
        { status: 401 }
      );
    }

    const secret = getSecret();
    let payload: { email?: string; otp?: string };

    try {
      const { payload: p } = await jwtVerify(otpToken, secret);
      payload = p as { email?: string; otp?: string };
    } catch {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Validate email and OTP match
    if (
      payload.email !== email.trim().toLowerCase() ||
      payload.otp   !== otp.trim()
    ) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 401 });
    }

    // Issue long-lived admin session token
    const adminToken = await new SignJWT({ email: payload.email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ ok: true });

    // Set admin session cookie
    response.cookies.set('admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear the OTP cookie
    response.cookies.set('otp_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('verify-otp error:', message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
