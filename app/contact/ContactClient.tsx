'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './contact.module.css';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic',
  'Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea',
  'Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands',
  'Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand',
  'Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau',
  'Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia',
  'Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka',
  'Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactClient() {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [company,   setCompany]   = useState('');
  const [product,   setProduct]   = useState('');
  const [message,   setMessage]   = useState('');

  const [countrySearch, setCountrySearch] = useState('');
  const [countryValue,  setCountryValue]  = useState('');
  const [countryOpen,   setCountryOpen]   = useState(false);

  const [selectFilled, setSelectFilled] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const countryRef   = useRef<HTMLDivElement>(null);

  const filtered = countrySearch.trim()
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase().trim()))
    : COUNTRIES;

  function selectCountry(country: string) {
    setCountrySearch(country);
    setCountryValue(country);
    setCountryOpen(false);
  }

  function handleCountryBlur() {
    setTimeout(() => {
      setCountryOpen(false);
      if (!countryValue && countrySearch) {
        const exact = COUNTRIES.find(
          (c) => c.toLowerCase() === countrySearch.toLowerCase()
        );
        if (exact) selectCountry(exact);
        else { setCountrySearch(''); setCountryValue(''); }
      }
    }, 150);
  }

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [message]);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function resetForm() {
    setFirstName(''); setLastName(''); setPhone(''); setEmail('');
    setCompany(''); setProduct(''); setMessage('');
    setCountrySearch(''); setCountryValue('');
    setSelectFilled(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone, company,
          country: countryValue, product, message,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setStatus('success');
        resetForm();
        setTimeout(() => setStatus('idle'), 5000);
      } else throw new Error(data?.error || 'server error');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  const btnLabel =
    status === 'loading' ? 'Sending…'
    : status === 'success' ? 'Message Sent!'
    : status === 'error'   ? 'Failed — try again'
    : 'Send Message';

  return (
    <main className={styles.contactPage}>
      
      {/* ── HERO ── */}
      <header className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow} data-reveal>Get In Touch</span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.1">
            Let&rsquo;s Build<br />Something Great.
          </h1>
          <p className={styles.heroDesc} data-reveal data-reveal-delay="0.15">
            Tell us about your venue and vision. Our team will get back within 24 hours with a tailored proposal.
          </p>
          <div className={styles.heroMeta} data-reveal data-reveal-delay="0.2">
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>24h</span>
              <span className={styles.heroStatLbl}>Response time</span>
            </div>
            <div className={styles.heroStatSep} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>100+</span>
              <span className={styles.heroStatLbl}>Venues served</span>
            </div>
            <div className={styles.heroStatSep} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>10+</span>
              <span className={styles.heroStatLbl}>Countries</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── INFO STRIP ── */}
      <div className={styles.infoStrip} data-reveal>
        <div className={styles.infoInner}>
          <a href="mailto:futureofgamingtech@gmail.com" className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoVal}>futureofgamingtech@gmail.com</span>
            </div>
          </a>
          <div className={styles.infoDivider} aria-hidden="true" />
          <a href="tel:+919876543210" className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoVal}>+91 98765 43210</span>
            </div>
          </a>
          <div className={styles.infoDivider} aria-hidden="true" />
          <div className={`${styles.infoCard} ${styles.infoCardPlain}`}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Response Time</span>
              <span className={styles.infoVal}>Within 24 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── GET IN TOUCH FORM ── */}
      {/* Reusing shared styles from globals or inline since this is the primary contact page */}
      <section id="get-in-touch" className={styles.gitchSection}>
        <div className={styles.gitchInner}>
          
          <div className={styles.gitchLeft}>
            <div className={styles.gitchLeftInner}>
              <h2 className={styles.gitchHeadline}>Start Your Journey With FOG.</h2>
              <p className={styles.gitchSub}>Whether you&rsquo;re planning a new venue or expanding an existing one &mdash; tell us your vision. We&rsquo;ll engineer it.</p>
              <div className={styles.gitchDivider} />
            </div>
          </div>

          <div className={styles.gitchRight}>
            <div className={styles.formWrap}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Let&rsquo;s Connect</h3>
                <p className={styles.formDesc}>We review every submission personally. Expect a reply within 24 hours.</p>
              </div>

              {status === 'success' && (
                <div className={styles.successMsg}>
                  <h4>Message Sent Successfully!</h4>
                  <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                  <div className={styles.group}>
                    <input
                      type="text" className={styles.input} placeholder=" "
                      autoComplete="given-name" required
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    />
                    <label className={styles.label}>First Name</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                  <div className={styles.group}>
                    <input
                      type="text" className={styles.input} placeholder=" "
                      autoComplete="family-name" required
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                    />
                    <label className={styles.label}>Last Name</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <input
                      type="tel" className={styles.input} placeholder=" "
                      autoComplete="tel" required
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                    <label className={styles.label}>Phone Number</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                  <div className={styles.group}>
                    <input
                      type="email" className={styles.input} placeholder=" "
                      autoComplete="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className={styles.label}>Email Address</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <input
                      type="text" className={styles.input} placeholder=" "
                      autoComplete="organization"
                      value={company} onChange={(e) => setCompany(e.target.value)}
                    />
                    <label className={styles.label}>Company Name</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                  
                  <div className={styles.group} ref={countryRef}>
                    <input
                      type="text" className={styles.input} placeholder=" "
                      autoComplete="off" role="combobox" aria-expanded={countryOpen}
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setCountryValue('');
                        setCountryOpen(true);
                      }}
                      onFocus={() => setCountryOpen(true)}
                      onBlur={handleCountryBlur}
                    />
                    <label className={`${styles.label} ${countryOpen || countrySearch ? (countryValue ? styles.labelFloatFilled : styles.labelFloat) : ''}`}>
                      Country
                    </label>
                    <span className={styles.bar} aria-hidden="true" />
                    <svg className={styles.caret} width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <ul className={`${styles.countryList} ${countryOpen && filtered.length > 0 ? styles.open : ''}`}>
                      {filtered.map((c) => (
                        <li key={c} onMouseDown={() => selectCountry(c)}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <select
                      className={styles.select} required
                      value={product}
                      onChange={(e) => {
                        setProduct(e.target.value);
                        setSelectFilled(!!e.target.value);
                      }}
                    >
                      <option value="" disabled />
                      <option value="hypergrid">HyperGrid</option>
                      <option value="lasertag">Laser Tag</option>
                      <option value="lasermaze">Laser Spy</option>
                      <option value="moments">Moments AI</option>
                      <option value="custom">Custom Solution</option>
                    </select>
                    <label className={`${styles.label} ${selectFilled || product ? (product ? styles.labelFloatFilled : styles.labelFloat) : ''}`}>
                      Interested In
                    </label>
                    <span className={styles.bar} aria-hidden="true" />
                    <svg className={styles.caret} width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.group}>
                    <textarea
                      ref={textareaRef}
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder=" " rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <label className={styles.label}>Your Message</label>
                    <span className={styles.bar} aria-hidden="true" />
                  </div>
                </div>

                <div className={styles.foot}>
                  <p className={styles.note}>
                    By submitting you agree to our <a href="#" className={styles.noteLink}>Privacy Policy</a>. No spam, ever.
                  </p>
                  <button
                    type="submit"
                    className={`${styles.btn} ${status === 'loading' ? styles.btnLoading : ''} ${status === 'success' ? styles.btnSuccess : ''} ${status === 'error' ? styles.btnError : ''}`}
                    disabled={status === 'loading'}
                  >
                    <span>{btnLabel}</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 9h12M9.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
