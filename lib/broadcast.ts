import { Resend } from 'resend';
import { getSubscribers } from './s3';
import type { PostMeta } from './blog';

export async function broadcastAnnouncement(meta: PostMeta) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY, cannot broadcast.');
      return false;
    }

    const subscribers = await getSubscribers();
    if (!subscribers.length) {
      console.log('No subscribers found. Skipping broadcast.');
      return true;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://futureofgaming.tech';
    const postUrl = `${siteUrl}/blog/${meta.slug}`;

    const emailSubject = `Announcement: ${meta.title}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border: 1px solid #222; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        ${meta.coverImage ? `
          <div style="width: 100%; max-height: 240px; overflow: hidden;">
            <img src="${meta.coverImage}" alt="${meta.title}" style="width: 100%; height: auto; display: block;" />
          </div>
        ` : ''}
        <div style="background: #F05023; padding: 24px;">
          <p style="color: #ffffff; font-size: 12px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px;">New Announcement</p>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 8px 0 0 0; line-height: 1.2;">${meta.title}</h1>
        </div>
        <div style="padding: 32px 24px; line-height: 1.6;">
          <p style="color: #888888; font-size: 12px; margin: 0 0 16px;">Published on ${meta.date} by ${meta.author}</p>
          <p style="color: #cccccc; font-size: 15px; margin: 0 0 24px; font-weight: 500;">${meta.excerpt}</p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${postUrl}" style="background: #F05023; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Read Full Announcement</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
          <p style="font-size: 11px; color: #666666; margin: 0; text-align: center;">You are receiving this email because you subscribed to FOG Technologies updates. If you want to unsubscribe, reply to this email.</p>
        </div>
      </div>
    `;

    // Resend allows up to 100 recipients per send on regular accounts, let's chunk into batches of 90.
    const batchSize = 90;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      console.log(`Sending broadcast to batch ${Math.floor(i / batchSize) + 1} with ${batch.length} subscribers...`);

      const { error } = await resend.emails.send({
        from: 'FOG Technologies <onboarding@resend.dev>',
        to: 'updates@futureofgaming.tech', // dummy recipient
        bcc: batch,
        subject: emailSubject,
        html: emailHtml,
      });

      if (error) {
        console.error('Error broadcasting batch:', error);
        return false;
      }
    }

    console.log(`Successfully broadcasted post ${meta.slug} to ${subscribers.length} subscribers.`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown broadcast error';
    console.error('Broadcast error:', msg);
    return false;
  }
}
