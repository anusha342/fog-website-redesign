'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './contact-form.module.css';

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

interface ContactFormProps {
  defaultProduct?: string;
}

export default function ContactForm({ defaultProduct = '' }: ContactFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [company,   setCompany]   = useState('');
  const [product,   setProduct]   = useState(defaultProduct);
  const [message,   setMessage]   = useState('');

  const [countrySearch, setCountrySearch] = useState('');
  const [countryValue,  setCountryValue]  = useState('');
  const [countryOpen,   setCountryOpen]   = useState(false);

  const [selectFilled, setSelectFilled] = useState(!!defaultProduct);
  const [status, setStatus] = useState<Status>('idle');

  // Update product if prop changes
  useEffect(() => {
    if (defaultProduct) {
      setProduct(defaultProduct);
      setSelectFilled(true);
    }
  }, [defaultProduct]);

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
        setTimeout(() => setStatus('idle'), 4000);
      } else throw new Error('server error');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const btnLabel =
    status === 'loading' ? 'Submitting…'
    : status === 'success' ? 'Message Sent!'
    : status === 'error'   ? 'Failed — try again'
    : 'Submit';

  const btnClass = [
    styles.btn,
    status === 'loading' ? styles.btnLoading : '',
    status === 'success' ? styles.btnSuccess : '',
    status === 'error'   ? styles.btnError   : '',
  ].filter(Boolean).join(' ');

  const countryLabelClass =
    countryOpen || countrySearch
      ? countryValue
        ? styles.labelFloatFilled
        : styles.labelFloat
      : '';

  const selectLabelClass =
    selectFilled
      ? styles.labelFloatFilled
      : product
      ? styles.labelFloat
      : '';

  return (
    <section id="get-in-touch" className={styles.section}>
      <div className={styles.inner}>

        {/* ── LEFT PANEL ── */}
        <div className={styles.left}>
          <div className={styles.leftInner}>
            <p className={styles.eyebrow}>Let's Connect</p>
            <h2 className={styles.headline}>Start Your Journey&nbsp;With FOG.</h2>
            <p className={styles.sub}>
              Whether you&rsquo;re planning a new venue or expanding an existing one &mdash; tell us your vision. We&rsquo;ll engineer it.
            </p>
            <div className={styles.divider} />
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={styles.right}>
          <div className={styles.formWrap}>
            {/* <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Let&rsquo;s Connect</h3>
              <p className={styles.formDesc}>We review every submission personally. Expect a reply within 24&nbsp;hours.</p>
            </div> */}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              {/* Row 1: First / Last */}
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

              {/* Row 2: Phone / Email */}
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

              {/* Row 3: Company / Country */}
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

                {/* Country combobox */}
                <div className={styles.group} ref={countryRef} style={{ position: 'relative' }}>
                  <input
                    type="text" className={styles.input} placeholder=" "
                    autoComplete="off"
                    role="combobox" aria-expanded={countryOpen} aria-autocomplete="list"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setCountryValue('');
                      setCountryOpen(true);
                    }}
                    onFocus={() => setCountryOpen(true)}
                    onBlur={handleCountryBlur}
                  />
                  <label className={`${styles.label} ${countryLabelClass}`}>Country</label>
                  <span className={styles.bar} aria-hidden="true" />
                  <svg className={styles.caret} width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <ul
                    className={`${styles.countryList} ${countryOpen && filtered.length > 0 ? styles.open : ''}`}
                    role="listbox" aria-label="Countries"
                  >
                    {filtered.map((country) => (
                      <li
                        key={country} role="option"
                        onMouseDown={(e) => { e.preventDefault(); selectCountry(country); }}
                      >
                        {country}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Row 4: Product / Message */}
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
                  <label className={`${styles.label} ${selectLabelClass}`}>Interested In</label>
                  <span className={styles.bar} aria-hidden="true" />
                  <svg className={styles.caret} width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
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

              {/* Footer */}
              {/* <div className={styles.foot}> */}
                {/* <p className={styles.note}>
                  By submitting you agree to our{' '}
                  <a href="#" className={styles.noteLink}>Privacy Policy</a>.
                  {' '}No spam, ever.
                </p> */}
                <button
                  type="submit"
                  className={btnClass}
                  disabled={status === 'loading'}
                >
                  <span>{btnLabel}</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 9h12M9.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              {/* </div> */}

            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
