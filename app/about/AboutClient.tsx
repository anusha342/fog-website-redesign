'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import ContactForm from '@/components/ContactForm';
import styles from './about.module.css';

/* ── SCROLL REVEAL ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── AWARD ICONS (inline SVG to keep rendering pure) ── */
const starIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const medalIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const trophyIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);

const AWARDS = [
  { year: '2024', icon: starIcon,   name: 'Best Immersive Entertainment Product', org: 'IAAPA Expo Asia — Singapore',             desc: 'HyperGrid recognised as the most innovative sensor-activated gaming floor at Asia\'s largest attractions trade event.', delay: '' },
  { year: '2023', icon: medalIcon,  name: 'Top 10 LBE Innovators',                org: 'Location-Based Entertainment Report',      desc: 'Named among the world\'s top 10 location-based entertainment companies redefining the guest experience.',              delay: '0.08' },
  { year: '2023', icon: trophyIcon, name: 'FEC Innovation Award',                 org: 'Family Entertainment Centre Summit — Dubai', desc: 'Laser Spy honoured for delivering the highest ROI payback of any new attraction category in the FEC sector.',           delay: '0.16' },
  { year: '2022', icon: starIcon,   name: 'AI in Entertainment Pioneer Award',    org: 'Gulf Games & Entertainment Show',          desc: 'Moments AI recognised for transforming guest highlights into shareable content, driving measurable repeat visit growth.',  delay: '0.24' },
  { year: '2022', icon: medalIcon,  name: 'Best New Laser Tag System',            org: 'IAAPA Expo — Orlando',                     desc: 'FOG Laser Tag awarded best-in-class for smart vest technology, real-time scoring, and seamless Moments AI integration.',   delay: '0.08' },
  { year: '2021', icon: trophyIcon, name: 'Emerging Tech Company of the Year',    org: 'Middle East Entertainment & Leisure Awards', desc: 'FOG Technologies awarded for rapid regional expansion and introducing world-class gaming experiences across 10+ countries.', delay: '0.16' },
];

const VALUES = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/></svg>,
    title: 'Innovation',
    body: 'We push the boundaries of what\'s possible in interactive entertainment technology.',
    delay: '',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Reliability',
    body: 'Our attractions are built to perform, with 99.9% uptime and rapid support response.',
    delay: '0.1',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    title: 'Speed',
    body: 'From consultation to go-live in weeks, not months. We respect your timeline.',
    delay: '0.2',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Partnership',
    body: 'We\'re not just vendors — we\'re partners invested in your venue\'s success.',
    delay: '0.3',
  },
];

const TIMELINE = [
  { year: '2019', title: 'Founded',        desc: 'FOG Technologies born in Surat with a vision to revolutionize family entertainment centres.',    blurb: 'Born from a passion for next-gen play, FOG set out to redefine what a family entertainment centre could be.' },
  { year: '2020', title: 'First Product',  desc: 'HyperGrid prototype completed and installed in the first beta venue.',                           blurb: '' },
  { year: '2021', title: 'Expansion',      desc: 'Reached 10 installations across 5 cities in India.',                                             blurb: '' },
  { year: '2022', title: 'Product Line',   desc: 'Launched Infinity Laser Tag and Laser Spy — completing the FOG ecosystem.',                      blurb: 'Three products. One vision. The FOG ecosystem took shape across India.' },
  { year: '2023', title: 'AI Integration', desc: 'Introduced Statue Game powered by real-time computer vision.',                                   blurb: '' },
  { year: '2024', title: 'Global Reach',   desc: 'Expansion into UAE, Singapore, and UK — bringing FOG to 3 new continents.',                     blurb: '' },
];

const TEAM = [
  { initials: 'RM', name: 'Raj Mehta',   role: 'CEO & Founder',               delay: '' },
  { initials: 'PS', name: 'Priya Sharma', role: 'Head of Business Development', delay: '0.1' },
  { initials: 'AP', name: 'Amit Patel',  role: 'CTO',                          delay: '0.2' },
  { initials: 'NG', name: 'Neha Gupta',  role: 'Head of Operations',           delay: '0.3' },
];

export default function AboutClient() {
  useScrollReveal();

  return (
    <div className={styles.page}>

      {/* ── 1. HERO ── */}
      <header className={styles.hero}>
        {/* Background photo */}
        <div className={styles.heroBgImg} aria-hidden="true">
          <Image
            src="/images/about-us/about-us.jpg"
            alt="FOG Technologies team celebrating at the IAAPI National Awards for Excellence 2026"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 22%' }}
            priority
          />
        </div>

        {/* Dark gradient scrim for legibility */}
        <div className={styles.heroOverlay} aria-hidden="true" />

        {/* Centered text content */}
        <div className={styles.heroContent}>
          {/* <p className={styles.heroEyebrow} data-reveal>
            01 — About FOG Technologies
          </p> */}
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.1">
            About Us
          </h1>
          {/* <p className={styles.heroDesc} data-reveal data-reveal-delay="0.2">
            Premium interactive entertainment for Family Entertainment Centers worldwide.
          </p> */}
        </div>
        

        {/* Scroll cue */}
        <div className={styles.heroScrollIndicator} aria-hidden="true">
          <div className={styles.scrollLine}>
            <div className={styles.scrollDot} />
          </div>
        </div>
      </header>

      {/* ── 2. AWARDS ── */}
      <section id="achievement" className={styles.awards}>
        <div className={styles.awardsInner}>

          {/* Header — left title + right stat */}
          <div className={styles.awardsHeader}>
            <div>
              {/* <p className={styles.awardsEyebrow} data-reveal>02 — Awards &amp; Recognition</p> */}
              <h2 className={styles.awardsTitle} data-reveal data-reveal-delay="0.1">
                Industry&apos;s Most<br />Recognised Platform
              </h2>
            </div>
            <div className={styles.awardsStat} data-reveal data-reveal-delay="0.15">
              <span className={styles.awardsStatNum}>06</span>
              <span className={styles.awardsStatLabel}>Awards Won</span>
            </div>
          </div>

          {/* Asymmetric bento grid */}
          <div className={styles.awardsGrid}>
            {AWARDS.map((a, i) => {
              const isHoriz = i === 3 || i === 4;
              const STAGGER = ['', '0.07', '0.12', '0.18', '0.24', '0.30'];
              return (
                <div
                  key={i}
                  className={isHoriz
                    ? `${styles.awardCard} ${styles.awardCardHoriz}`
                    : styles.awardCard}
                  data-reveal
                  data-reveal-delay={STAGGER[i]}
                >
                  {isHoriz ? (
                    /* Horizontal layout: icon sits flush left, text fills right */
                    <>
                      <div className={styles.awardIconWrap}>{a.icon}</div>
                      <div className={styles.awardMain}>
                        <span className={styles.awardIndex}>{String(i + 1).padStart(2, '0')}</span>
                        <p className={styles.awardName}>{a.name}</p>
                        <p className={styles.awardOrg}>{a.org}</p>
                        <p className={styles.awardDesc}>{a.desc}</p>
                      </div>
                    </>
                  ) : (
                    /* Vertical layout (small + featured cards) */
                    <div className={styles.awardCardContent}>
                      <span className={styles.awardIndex}>{String(i + 1).padStart(2, '0')}</span>
                      <div className={styles.awardIconWrap}>{a.icon}</div>
                      <p className={styles.awardName}>{a.name}</p>
                      <p className={styles.awardOrg}>{a.org}</p>
                      <p className={styles.awardDesc}>{a.desc}</p>
                    </div>
                  )}
                  {/* Ghost year watermark — decorative */}
                  <span className={styles.awardYearBg} aria-hidden="true">{a.year}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. WHAT DRIVES US ── */}
      <section id="what-drives-us" className={styles.drives}>
        <div className={styles.drivesInner}>
          <div className={styles.drivesHeader}>
            {/* <p className={styles.drivesEyebrow} data-reveal>03 — What Drives Us</p> */}
            <h2 className={styles.drivesTitle} data-reveal data-reveal-delay="0.1">
              Built on Four Principles
            </h2>
          </div>
          <div className={styles.drivesGrid}>
            {VALUES.map((v, i) => {
              const STAGGER = ['', '0.08', '0.16', '0.24'];
              return (
                <div
                  key={i}
                  className={styles.driveCard}
                  data-reveal
                  data-reveal-delay={STAGGER[i]}
                >
                  {/* <span className={styles.driveCardIndex}>
                    {String(i + 1).padStart(2, '0')}
                  </span> */}
                  <div className={styles.driveIconWrap}>{v.icon}</div>
                  <h3 className={styles.driveCardTitle}>{v.title}</h3>
                  <p className={styles.driveCardBody}>{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. TIMELINE ── */}
      <section id="timeline" className={styles.timeline}>
        <div className={styles.timelineInner}>
          <div className={styles.tlHeader}>
            <h2 className={styles.timelineTitle} data-reveal data-reveal-delay="0.1">
              The FOG Journey
            </h2>
          </div>

          <div className={styles.tlBody}>
            {TIMELINE.map((item, i) => {
              const isLast = i === TIMELINE.length - 1;
              return (
                <div key={i} className={styles.tlRow}>
                  {/* Left — sparse contextual blurb */}
                  <div className={styles.tlLeftCell}>
                    {item.blurb && <p className={styles.tlBlurb}>{item.blurb}</p>}
                  </div>

                  {/* Centre — continuous spine + accent dot */}
                  <div className={`${styles.tlMidCell}${isLast ? ` ${styles.tlMidCellLast}` : ''}`}>
                    <span className={styles.tlDot} aria-hidden="true" />
                  </div>

                  {/* Right — year badge, heading, description */}
                  <div className={styles.tlRightCell} data-reveal>
                    <span className={styles.tlYear}>{item.year}</span>
                    <h3 className={styles.tlNodeTitle}>{item.title}</h3>
                    <p className={styles.tlNodeDesc}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. TEAM ── */}
      <section id="team" className={styles.team}>
        <div className={styles.teamInner}>
          <div className={styles.teamHeader}>
            <h2 className={styles.teamTitle} data-reveal data-reveal-delay="0.1">
              Our Team
            </h2>
          </div>
          <div className={styles.teamGrid}>
            {TEAM.map((member, i) => (
              <div
                key={i}
                className={styles.teamCard}
                data-reveal
                {...(member.delay ? { 'data-reveal-delay': member.delay } : {})}
              >
                <div className={styles.teamAvatar}>
                  <span className={styles.teamInitial}>{member.initials}</span>
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. GET IN TOUCH ── */}
      <ContactForm />

    </div>
  );
}
