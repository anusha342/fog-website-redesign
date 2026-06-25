import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const results: Record<string, any> = {
    resend: null,
    gemini: null,
    slack: null,
  };

  // 1. TEST RESEND
  const resendKey = process.env.RESEND_API_KEY;
  const contactEmails = process.env.CONTACT_EMAILS;

  if (!resendKey) {
    results.resend = { ok: false, error: 'RESEND_API_KEY is not defined in .env.local' };
  } else if (!contactEmails) {
    results.resend = { ok: false, error: 'CONTACT_EMAILS is not defined in .env.local' };
  } else {
    try {
      const resend = new Resend(resendKey);
      const recipients = contactEmails.split(',').map(e => e.trim()).filter(Boolean);
      const { data, error } = await resend.emails.send({
        from: 'FOG Technologies <onboarding@resend.dev>',
        to: recipients,
        subject: 'Test Email — FOG Debug Endpoint',
        html: '<p>If you see this, your Resend setup is working!</p>',
      });
      if (error) {
        results.resend = { ok: false, source: 'Resend API Error', error };
      } else {
        results.resend = { ok: true, data };
      }
    } catch (err: any) {
      results.resend = { ok: false, source: 'Code Exception', error: err.message };
    }
  }

  // 2. TEST GEMINI
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    results.gemini = { ok: false, error: 'GEMINI_API_KEY is not defined in .env.local' };
  } else {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "hello world"' }] }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        results.gemini = { ok: false, source: 'Gemini API Error', status: res.status, error: data };
      } else {
        results.gemini = { ok: true, data };
      }
    } catch (err: any) {
      results.gemini = { ok: false, source: 'Code Exception', error: err.message };
    }
  }

  // 3. TEST SLACK
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) {
    results.slack = { ok: false, error: 'SLACK_WEBHOOK_URL is not defined in .env.local' };
  } else {
    try {
      const res = await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Test message from FOG debug page' }),
      });
      const txt = await res.text();
      results.slack = { ok: res.ok, status: res.status, response: txt };
    } catch (err: any) {
      results.slack = { ok: false, source: 'Code Exception', error: err.message };
    }
  }

  return NextResponse.json(results);
}
