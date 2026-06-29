import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSubscribers, saveSubscribers } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalised)) {
      return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
    }

    // Retrieve subscribers list
    const subscribers = await getSubscribers();

    // Check if already subscribed
    if (subscribers.includes(normalised)) {
      return NextResponse.json({ ok: true, message: 'Already subscribed.' });
    }

    // Append and save
    subscribers.push(normalised);
    await saveSubscribers(subscribers);

    // Send welcome email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: 'FOG Technologies <onboarding@resend.dev>',
      to: normalised,
      subject: 'Welcome to FOG Technologies Updates!',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border: 1px solid #222; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <div style="background: #F05023; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px;">FOG Technologies</h1>
          </div>
          <div style="padding: 32px 24px; line-height: 1.6;">
            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; font-weight: 600;">Welcome to our newsletter!</h2>
            <p style="color: #cccccc; margin: 0 0 20px; font-size: 14px;">Thank you for subscribing to updates from FOG Technologies. You're now on the list to receive our latest product announcements, tech updates, and industry insights directly in your inbox.</p>
            <p style="color: #cccccc; margin: 0 0 24px; font-size: 14px;">Whenever we launch new games, post exciting announcements, or share developer insights, you'll be the first to know.</p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://futureofgaming.tech/blog" style="background: #F05023; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">Explore Our Blog</a>
            </div>
            <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="font-size: 11px; color: #666666; margin: 0; text-align: center;">You are receiving this email because you subscribed to FOG Technologies updates. If you want to unsubscribe, please reply to this email.</p>
          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error('Welcome email sending error:', sendError);
      // We don't fail the registration if only the welcome email fails
    }

    return NextResponse.json({ ok: true, message: 'Subscription successful!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('POST /api/subscribe error:', message);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
