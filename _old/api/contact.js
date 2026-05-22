// Vercel Serverless Function — POST /api/contact
// Receives form data, sends an email via Resend to all configured recipients.
//
// Required environment variables (set in Vercel dashboard, never in code):
//   RESEND_API_KEY   — your Resend API key
//   CONTACT_EMAILS   — comma-separated recipient list, e.g. "a@example.com,b@example.com"
//
// The "from" address must come from a domain you have verified in Resend.
// During development you can use "onboarding@resend.dev" (Resend sandbox sender).
// For production, add your domain in Resend → Domains and update FROM_ADDRESS below.

const FROM_ADDRESS = 'FOG Technologies <onboarding@resend.dev>';

const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    country,
    product,
    message,
  } = req.body || {};

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !country || !product) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipientEnv = process.env.CONTACT_EMAILS;

  if (!apiKey || !recipientEnv) {
    console.error('Missing RESEND_API_KEY or CONTACT_EMAILS env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const recipients = recipientEnv.split(',').map(e => e.trim()).filter(Boolean);

  const productLabel = {
    hypergrid:  'HyperGrid',
    lasertag:   'Laser Tag',
    laserspy:   'Laser Spy',
    moments:    'Moments AI',
    custom:     'Custom Solution',
  }[product] || product;

  const html = `
    <table style="font-family:sans-serif;font-size:15px;color:#131313;border-collapse:collapse;width:100%;max-width:600px">
      <tr style="background:#F05023;color:#fff">
        <td colspan="2" style="padding:16px 20px;font-size:18px;font-weight:700">
          New Inquiry — ${productLabel}
        </td>
      </tr>
      ${row('Name',        `${firstName} ${lastName}`)}
      ${row('Email',       email)}
      ${row('Phone',       phone)}
      ${row('Company',     company || '—')}
      ${row('Country',     country)}
      ${row('Interested In', productLabel)}
      ${row('Message',     message ? message.replace(/\n/g, '<br>') : '—')}
    </table>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from:    FROM_ADDRESS,
      to:      recipients,
      replyTo: email,
      subject: `New Inquiry — ${productLabel} — ${firstName} ${lastName}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

function row(label, value) {
  return `
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:12px 20px;font-weight:600;width:160px;background:#f5f5f5">${label}</td>
      <td style="padding:12px 20px">${value}</td>
    </tr>
  `;
}
