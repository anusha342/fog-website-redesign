import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error('ADMIN_JWT_SECRET is not set');
  return new TextEncoder().encode(s);
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Check against allowlist
    const allowed = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!allowed.includes(normalised)) {
      // Return the same message as a valid email to prevent enumeration
      return NextResponse.json({ ok: true });
    }

    const otp = generateOtp();

    // Store OTP in a signed JWT cookie (stateless — works on serverless)
    const secret = getSecret();
    const otpToken = await new SignJWT({ email: normalised, otp })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(secret);

    // Send OTP email via Resend
    const { error: sendError } = await resend.emails.send({
      from: 'FOG Technologies Admin <onboarding@resend.dev>',
      to: normalised,
      subject: `Your FOG Admin OTP: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #F05023; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <p style="color: #fff; font-size: 18px; font-weight: 700; margin: 0;">FOG Technologies — Admin Access</p>
          </div>
          <div style="background: #111; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #222; border-top: none;">
            <p style="color: #aaa; font-size: 14px; margin: 0 0 20px;">Your one-time password is:</p>
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #fff;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 12px; margin: 0;">This OTP expires in <strong style="color:#aaa">10 minutes</strong>. If you did not request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('otp_token', otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('send-otp error:', message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
