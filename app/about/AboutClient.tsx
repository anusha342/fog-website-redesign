'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import ContactForm from '@/components/ContactForm';
import styles from './about.module.css';

function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => rej();
    document.head.appendChild(s);
  });
}

function useLenis() {
  useEffect(() => {
    let animId: number;
    loadScript('https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js')
      .then(() => {
        const LenisClass = (window as any).Lenis;
        if (!LenisClass) return;
        const lenis = new LenisClass({ lerp: 0.075, smoothWheel: true });
        function raf(time: number) { lenis.raf(time); animId = requestAnimationFrame(raf); }
        animId = requestAnimationFrame(raf);
        (window as any).__fogLenis = lenis;
      })
      .catch(() => { });
    return () => { cancelAnimationFrame(animId); };
  }, []);
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-revealed'); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const AWARDS = [
  { year: '2024', name: 'Best Immersive Entertainment Product', org: 'IAAPA Expo Asia — Singapore', desc: 'HyperGrid recognised as the most innovative sensor-activated gaming floor at Asia\'s largest attractions trade event.' },
  { year: '2023', name: 'Top 10 LBE Innovators', org: 'Location-Based Entertainment Report', desc: 'Named among the world\'s top 10 location-based entertainment companies redefining the guest experience.' },
  { year: '2023', name: 'FEC Innovation Award', org: 'Family Entertainment Centre Summit — Dubai', desc: 'Laser Spy honoured for delivering the highest ROI payback of any new attraction category in the FEC sector.' },
  { year: '2022', name: 'AI in Entertainment Pioneer Award', org: 'Gulf Games & Entertainment Show', desc: 'Moments AI recognised for transforming guest highlights into shareable content, driving measurable repeat visit growth.' },
  { year: '2022', name: 'Best New Laser Tag System', org: 'IAAPA Expo — Orlando', desc: 'FOG Laser Tag awarded best-in-class for smart vest technology, real-time scoring, and seamless Moments AI integration.' },
  { year: '2021', name: 'Emerging Tech Company of the Year', org: 'Middle East Entertainment & Leisure Awards', desc: 'FOG Technologies awarded for rapid regional expansion and introducing world-class gaming experiences across 10+ countries.' },
];

const VALUES = [
  {
    num: '01',
    title: 'Innovation',
    body: 'We push the boundaries of what\'s possible in interactive entertainment technology.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" /></svg>,
  },
  {
    num: '02',
    title: 'Reliability',
    body: 'Our attractions are built to perform, with 99.9% uptime and rapid support response.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    num: '03',
    title: 'Speed',
    body: 'From consultation to go-live in weeks, not months. We respect your timeline.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  },
  {
    num: '04',
    title: 'Partnership',
    body: 'We\'re not just vendors — we\'re partners invested in your venue\'s long-term success.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
];

const TIMELINE = [
  { year: '2019', title: 'Founded', desc: 'FOG Technologies born in Surat with a vision to revolutionize family entertainment centres across the world.' },
  { year: '2020', title: 'First Product', desc: 'HyperGrid prototype completed and installed in the first beta venue. The floor that started it all.' },
  { year: '2021', title: 'Expansion', desc: 'Reached 10 installations across 5 cities in India. Operators saw ROI in under 6 months.' },
  { year: '2022', title: 'Full Ecosystem', desc: 'Launched Infinity Laser Tag and Laser Spy — completing the FOG product ecosystem.' },
  { year: '2023', title: 'AI Integration', desc: 'Introduced Moments AI — real-time computer vision that turns every game into a shareable highlight.' },
  { year: '2024', title: 'Global Reach', desc: 'Expansion into UAE, Singapore, and UK — bringing FOG experiences to 3 new continents.' },
];

const FOUNDERS = [
  {
    name: 'Vishal Mehta',
    role: 'CEO',
    credentials: 'IIT Delhi | Ex - Meesho, Flipkart',
    image: '/images/about-us/Vishal sir.png',
    bio: 'Strategic visionary, transforming play into performance with a track record in e-commerce innovation.'
  },
  {
    name: 'Aditya Bagrecha',
    role: 'CTO',
    credentials: 'IIT Bombay | Ex - Turing, Qualcomm',
    image: '/images/about-us/Aditya Sir.jfif',
    bio: 'Tech architect, fusing algorithms and creativity to redefine the gaming landscape for the future.'
  }
];

export default function AboutClient() {
  useLenis();
  useScrollReveal();

  return (
    <div className={styles.page}>

      {/* ── 1. HERO — video bg + stats locked to one screen ── */}
      <div className={styles.heroWrap}>
        <header className={styles.hero}>
          <video
            className={styles.heroBgVideo}
            src="/videos/About-us/Inside FOG - What It Takes to Build an Attraction - TRIM - Videobolt.net.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle} data-reveal>
              <span>We Build Tomorrow&apos;s</span>
              <span>Entertainment</span>
            </h1>
            <p className={styles.heroDesc} data-reveal data-reveal-delay="0.12">
              Premium interactive entertainment — engineered<br />for operators, designed for players.
            </p>
          </div>
        </header>

        {/* ── STATS BAR — product-page style, immediately below photo ── */}
        <div className={styles.heroStats}>
          <div className={styles.heroStatsGrid}>
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.1">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                <span className={styles.heroStatLabel}>Installations</span>
              </div>
              <span className={styles.heroStatNum}>150<span className={styles.heroStatUnit}>+</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.18">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span className={styles.heroStatLabel}>Countries</span>
              </div>
              <span className={styles.heroStatNum}>15<span className={styles.heroStatUnit}>+</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.26">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                <span className={styles.heroStatLabel}>Industry Awards</span>
              </div>
              <span className={styles.heroStatNum}>03</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.34">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span className={styles.heroStatLabel}>Founded in Surat</span>
              </div>
              <span className={styles.heroStatNum}>2019</span>
            </div>
          </div>
        </div>
      </div>



      {/* ── 3. AWARDS ── */}
      <section id="achievement" className={styles.awards}>
        <div className={styles.awardsInner}>
          <div className={styles.awardsHeader}>
            <div>
              <p className={styles.sectionEyebrow} data-reveal>Recognition</p>
              <h2 className={styles.awardsTitle} data-reveal data-reveal-delay="0.08">
                Our Achievements
              </h2>
            </div>
            <div className={styles.awardsStat} data-reveal data-reveal-delay="0.12">
              <span className={styles.awardsStatNum}>06</span>
              <span className={styles.awardsStatLabel}>Awards Won</span>
            </div>
          </div>

          <div className={styles.awardsGrid}>
            {AWARDS.map((a, i) => {
              const STAGGER = ['', '0.06', '0.12', '0.18', '0.24', '0.30'];
              const isWide = i === 3 || i === 4;
              return (
                <div
                  key={i}
                  className={`${styles.awardCard}${isWide ? ` ${styles.awardCardWide}` : ''}${i === 0 ? ` ${styles.awardCardFeatured}` : ''}`}
                  data-reveal
                  data-reveal-delay={STAGGER[i]}
                >
                  <span className={styles.awardYear} aria-hidden="true">{a.year}</span>
                  <div className={styles.awardContent}>
                    <p className={styles.awardName}>{a.name}</p>
                    <p className={styles.awardOrg}>{a.org}</p>
                    {(i === 0 || isWide) && <p className={styles.awardDesc}>{a.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. VALUES ── */}
      <section id="values" className={styles.values}>
        <div className={styles.valuesInner}>
          <div className={styles.valuesHeader}>
            <p className={styles.sectionEyebrow} data-reveal>What Drives Us</p>
            <h2 className={styles.valuesTitle} data-reveal data-reveal-delay="0.08">
              Built on Four Principles
            </h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map((v, i) => {
              const STAGGER = ['', '0.08', '0.16', '0.24'];
              return (
                <div key={i} className={styles.valueCard} data-reveal data-reveal-delay={STAGGER[i]}>
                  <span className={styles.valueNum} aria-hidden="true">{v.num}</span>
                  <div className={styles.valueIconWrap}>{v.icon}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. TIMELINE ── */}
      <section id="timeline" className={styles.timeline}>
        <div className={styles.timelineInner}>
          <div className={styles.tlHeader}>
            <p className={styles.sectionEyebrow} data-reveal>Since 2019</p>
            <h2 className={styles.timelineTitle} data-reveal data-reveal-delay="0.08">
              The FOG Journey
            </h2>
          </div>

          <div className={styles.tlContainer}>
            <div className={styles.tlMainSpine} aria-hidden="true" />
            <div className={styles.tlList}>
              {TIMELINE.map((item, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`${styles.tlItemNew} ${isEven ? styles.tlItemLeft : styles.tlItemRight}`}
                    data-reveal
                    data-reveal-delay={`${i * 0.08}`}
                  >
                    <div className={styles.tlDotContainer} aria-hidden="true">
                      <span className={styles.tlDotNew} />
                    </div>
                    <div className={styles.tlCard}>
                      <span className={styles.tlYearNew}>{item.year}</span>
                      <h3 className={styles.tlTitleNew}>{item.title}</h3>
                      <p className={styles.tlDescNew}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TEAM ── */}
      <section id="team" className={styles.team}>
        <div className={styles.teamInner}>
          <div className={styles.teamHeader}>
            <h2 className={styles.teamTitle} data-reveal data-reveal-delay="0.08">
              Meet The Founders
            </h2>
          </div>

          <div className={styles.teamGrid} data-reveal data-reveal-delay="0.12">
            {FOUNDERS.map((founder, i) => (
              <div key={i} className={styles.founderCard}>
                <div className={styles.founderAvatarWrap}>
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    sizes="(max-width: 640px) 240px, 300px"
                    className={styles.founderAvatar}
                    priority
                  />
                </div>
                <h3 className={styles.founderName}>
                  {founder.name} &ndash; {founder.role}
                </h3>
                <p className={styles.founderCredentials}>{founder.credentials}</p>
                <p className={styles.founderBio}>{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. GET IN TOUCH ── */}
      <ContactForm />

    </div>
  );
}
