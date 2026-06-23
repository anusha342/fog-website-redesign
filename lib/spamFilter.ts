export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  country?: string;
  product?: string;
  message?: string;
}

/**
 * Perform deterministic rules checking on lead details.
 * Catches 95%+ of bot spam quickly and for free.
 */
export function hardSpamCheck(lead: LeadData): { isSpam: boolean; reason: string } {
  const fn = (lead.firstName || '').trim();
  const ln = (lead.lastName || '').trim();
  const em = (lead.email || '').toLowerCase().trim();
  const co = (lead.company || '').toLowerCase().trim();
  const msg = (lead.message || '').toLowerCase().trim();
  const full = `${fn} ${ln} ${msg} ${co} ${em}`;

  // 1. Cyrillic / Russian text anywhere
  if (/[\u0400-\u04FF]/.test(full)) {
    return { isSpam: true, reason: 'Cyrillic/Russian text detected' };
  }

  // 2. Duplicated name (SandraRoF SandraRoF, Tyrondop Tyrondop, MichBraig MichBraig)
  if (fn && ln && fn.toLowerCase() === ln.toLowerCase() && fn.length > 3) {
    return { isSpam: true, reason: 'Duplicate first/last name (bot pattern)' };
  }

  // 3. Name contains URL or HTML
  if (/https?:\/\/|<a\s|<\/a>|href=/i.test(fn + ' ' + ln)) {
    return { isSpam: true, reason: 'URL/HTML in name field' };
  }

  // 4. Adult / cam / escort content
  const adultKeywords = ['cam show', 'webcam', 'porn', 'escort', 'milf', 'nude', 'erotic', 'sex chat', 'adult content'];
  for (let i = 0; i < adultKeywords.length; i++) {
    if (msg.includes(adultKeywords[i])) {
      return { isSpam: true, reason: 'Adult/cam content' };
    }
  }

  // 5. Casino / gambling / forex spam
  const gamblingKeywords = ['pokies', 'casino gaming', 'online casino', 'kraken', 'forex trading', 'trading bot', 'crypto mining'];
  for (let j = 0; j < gamblingKeywords.length; j++) {
    if (msg.includes(gamblingKeywords[j])) {
      return { isSpam: true, reason: 'Gambling/casino/crypto spam' };
    }
  }

  // 6. HTML anchor tag / affiliate links in message
  if (/<a\s+href|href=https?:|<\/a>/i.test(msg)) {
    return { isSpam: true, reason: 'HTML/affiliate link in message' };
  }

  // 7. Suspicious email patterns: numeric dot pattern (j.28.5.69.9.8@), random short prefix
  if (/^[a-z]?\.\d+\.\d+/.test(em)) {
    return { isSpam: true, reason: 'Numeric dot email pattern' };
  }

  // 8. Russian email domains (.ru is overwhelmingly spam in our context)
  if (/@\S*\.ru($|\s)/.test(em)) {
    return { isSpam: true, reason: 'Russian email domain' };
  }

  // 9. Disposable / known-spam email domains
  const disposable = ['@melssa.com', '@karamelka-mail.ru', '@letter42.com', '@duck.com', '@gmx.com', '@yandex.ru'];
  for (let k = 0; k < disposable.length; k++) {
    if (em.includes(disposable[k])) {
      return { isSpam: true, reason: 'Disposable/spam email domain' };
    }
  }

  // 10. Fake company "google" / "test" with no real context
  if (co === 'google' || co === 'test' || co === 'asdf' || co === 'qwerty') {
    return { isSpam: true, reason: `Fake company name (${co})` };
  }

  // 11. Empty name
  if (!fn && !ln) {
    return { isSpam: true, reason: 'No name provided' };
  }

  // 12. Single random suffix patterns (XRumer, RoF, boRk type bot suffixes)
  if (/[a-z]+[A-Z][a-z]+[A-Z]/.test(fn) && fn.length > 6 && fn === ln) {
    return { isSpam: true, reason: 'Bot-pattern name' };
  }

  return { isSpam: false, reason: '' };
}

/**
 * Call the Gemini API to filter grey-area submissions (jobs, SEO cold pitching, unrelated stuff).
 */
export async function filterLeadWithGemini(
  lead: LeadData
): Promise<{ isGenuine: boolean; reason: string; confidence: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Spam Filter] GEMINI_API_KEY is not defined, skipping AI validation.');
    return { isGenuine: true, reason: 'API key not configured', confidence: 'low' };
  }

  const prompt = `Lead filter for FOG Technologies, an amusement gaming manufacturer in India.
FOG makes arcade machines, kiddie rides, simulators, VR/AR, redemption games, laser tag, hyper grid for amusement centres, FECs, malls, theme parks.

Name: ${lead.firstName} ${lead.lastName}
Email: ${lead.email}
Company: ${lead.company || ''}
Country: ${lead.country || ''}
Message: ${lead.message || ''}

Mark as SPAM if message indicates ANY:
- Job/employment seeking (looking for opportunity, role, fresher, my resume, my portfolio, hire me, 3D artist, environment artist, game developer, unity developer, internship)
- SEO/marketing cold pitch (rank your site, backlinks, guest post, digital marketing services, increase traffic)
- Web development cold pitch (we build websites, mobile app development services)
- Medical/health/pharma (chiropractic, lumbar, cbd, ayurveda, medication)
- Crypto/forex/casino/affiliate marketing pitch
- Adult/cam/escort content
- Generic untargeted message that does not mention amusement, gaming, FOG, hyper grid, arcade, FEC, venue, pricing, demo, distributor

Mark as GENUINE if person wants: product info, pricing, quote, demo, to set up a venue/arcade/FEC, distribution, investment in our products. Even short messages like 'tell me prices' or 'send quote' are genuine.
Empty/NA company with a real-sounding message = individual buyer = genuine.

Return raw JSON only. No markdown. Do not wrap response in markdown blocks.
{"isGenuine":true,"reason":"short reason","confidence":"high"}`;

  try {
    // Calling Gemini 2.5 Flash model directly via HTTP fetch to keep the app lightweight
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error('[Spam Filter] Gemini API filter error:', error);
    return { isGenuine: true, reason: `API error: ${error.message}`, confidence: 'low' };
  }
}

/**
 * Post a notification to Slack via a Slack Webhook URL.
 */
export async function postToSlack(text: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return response.ok;
  } catch (error) {
    console.error('[Spam Filter] Error posting to Slack:', error);
    return false;
  }
}
