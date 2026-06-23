import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hardSpamCheck, filterLeadWithGemini, postToSlack } from '@/lib/spamFilter';

const CONTACT_EMAILS = process.env.CONTACT_EMAILS || '';

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      country,
      product,
      message,
    } = body;

    // Basic server-side validation
    if (!firstName || !lastName || !email || !phone || !country || !product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const lead = {
      firstName,
      lastName,
      email,
      phone,
      company,
      country,
      product,
      message: message || '',
    };

    // 1. Deterministic Hard Spam check
    const hardCheck = hardSpamCheck(lead);
    if (hardCheck.isSpam) {
      console.log(`[Spam Filter] Deterministic spam blocked: "${hardCheck.reason}" for lead: ${email}`);
      if (process.env.SLACK_WEBHOOK_URL) {
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
        await postToSlack(
          `*Spam filtered (Deterministic)* — ${fullName}\n` +
          `Email: ${email}\n` +
          `Company: ${company || '—'}\n` +
          `Reason: ${hardCheck.reason}`
        );
      }
      return NextResponse.json({ ok: true, success: true });
    }

    // 2. Gemini soft spam check
    const aiCheck = await filterLeadWithGemini(lead);
    if (!aiCheck.isGenuine) {
      console.log(`[Spam Filter] Gemini spam blocked: "${aiCheck.reason}" (Confidence: ${aiCheck.confidence}) for lead: ${email}`);
      if (process.env.SLACK_WEBHOOK_URL) {
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
        await postToSlack(
          `*Spam filtered (Gemini AI)* — ${fullName}\n` +
          `Email: ${email}\n` +
          `Company: ${company || '—'}\n` +
          `Reason: ${aiCheck.reason} (Confidence: ${aiCheck.confidence})`
        );
      }
      return NextResponse.json({ ok: true, success: true });
    }

    // Optional Slack notification for genuine leads
    if (process.env.SLACK_WEBHOOK_URL) {
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
      const productLabels: Record<string, string> = {
        hypergrid: 'HyperGrid',
        lasertag: 'Laser Tag',
        lasermaze: 'Laser Spy',
        moments: 'Moments AI',
        custom: 'Custom Solution',
      };
      const productLabel = productLabels[product] || product;
      const slackOk = await postToSlack(
        `*New Genuine Lead Received* — ${fullName}\n` +
        `Product: ${productLabel}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Company: ${company || '—'}\n` +
        `Country: ${country}\n` +
        `Message: ${message || '—'}`
      );
      console.log('[Slack Notification] Sent status:', slackOk);
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!CONTACT_EMAILS) {
      console.error('Missing CONTACT_EMAILS');
      return NextResponse.json(
        { error: 'Recipient email not configured' },
        { status: 500 }
      );
    }

    const recipients = CONTACT_EMAILS.split(',').map(e => e.trim()).filter(Boolean);

    const productLabels: Record<string, string> = {
      hypergrid: 'HyperGrid',
      lasertag: 'Laser Tag',
      lasermaze: 'Laser Spy',
      moments: 'Moments AI',
      custom: 'Custom Solution',
    };
    const productLabel = productLabels[product] || product;

    const { error } = await resend.emails.send({
      from: 'FOG Technologies <onboarding@resend.dev>',
      to: recipients,
      replyTo: email,
      subject: `New Inquiry — ${productLabel} — ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #F05023; color: white; padding: 20px; font-size: 20px; font-weight: bold;">
            New Inquiry: ${productLabel}
          </div>
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Name</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${company || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Country</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Product</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${productLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message || '—'}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 15px; background-color: #f9f9f9; color: #888; font-size: 12px; text-align: center;">
            This email was sent from the FOG Technologies contact form.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
