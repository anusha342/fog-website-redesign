'use client';

import { useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import styles from './contact.module.css';

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

export default function ContactClient() {
  useLenis();

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

  // 3D Card Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 6; // Max tilt angle in degrees
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    const tiltX = -percentY * maxTilt;
    const tiltY = percentX * maxTilt;
    card.style.setProperty('--rx', `${tiltX}deg`);
    card.style.setProperty('--ry', `${tiltY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <main className={styles.contactPage}>

      {/* ── HERO ── */}
      <header className={styles.hero}>
        {/* Futuristic tech scanlines & overlays */}
        <div className={styles.scanlines} aria-hidden="true" />

        {/* HUD Corners for futuristic light aesthetic */}
        <div className={`${styles.hudCorner} ${styles.hudTl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudTr}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudBl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudBr}`} aria-hidden="true" />

        {/* Centered text content */}
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow} data-reveal>Get In Touch</p>
          <h1 className={styles.heroTitle}>Contact & Location</h1>
          <p className={styles.heroSub} data-reveal>
            Have questions about our location-based entertainment systems? Our engineering and support teams are here to help.
          </p>
        </div>

        {/* Scroll cue */}
        <div className={styles.heroScrollIndicator} aria-hidden="true">
          <div className={styles.heroScrollLine}>
            <div className={styles.heroScrollDot} />
          </div>
        </div>
      </header>

      {/* ── INFO STRIP ── */}
      <div className={styles.infoStrip} data-reveal>
        <div className={styles.infoInner}>

          {/* Email — left */}
          <div className={styles.infoCardContainer}>
            <a
              href="mailto:futureofgamingtech@gmail.com"
              className={styles.infoCard}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.infoCardAccentLine} />
              <div className={styles.infoCardInner}>
                <div className={styles.infoIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoVal}>futureofgamingtech@gmail.com</span>
                </div>
              </div>
            </a>
          </div>

          <div className={styles.infoDivider} aria-hidden="true" />

          {/* Address — centre */}
          <div className={styles.infoCardContainer}>
            <div
              className={`${styles.infoCard} ${styles.infoCardCenter} ${styles.infoCardPlain}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.infoCardAccentLine} />
              <div className={styles.infoCardInner}>
                <div className={styles.infoIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Address</span>
                  <span className={styles.infoVal}>
                    D-203, Aagam Shopping World,<br />
                    Vesu Canal Rd, Surat, Gujarat 395007
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoDivider} aria-hidden="true" />

          {/* Phone — right */}
          <div className={styles.infoCardContainer}>
            <a
              href="tel:+919876543210"
              className={`${styles.infoCard} ${styles.infoCardRight}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.infoCardAccentLine} />
              <div className={styles.infoCardInner}>
                <div className={styles.infoIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoVal}>+91 98765 43210</span>
                </div>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* ── LOCATION MAP ── */}
      <section className={styles.mapSection} aria-label="Our location on the map">
        <div className={styles.mapHeader} data-reveal>
          <span className={styles.mapEyebrow}>Find Us</span>
          <h2 className={styles.mapTitle}>Our Location</h2>
        </div>
        <div className={styles.mapInner}>
          <div className={styles.mapFrame}>
            <iframe
              src="https://maps.google.com/maps?q=FOG+Technologies,+Aagam+Shopping+World,+D-203,+Vesu+Canal+Rd,+Near+Agarwal+School,+Surat,+Gujarat+395007&z=16&output=embed"
              title="FOG Technologies office location — Surat, Gujarat"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.mapIframe}
            />
          </div>
        </div>
      </section>

      {/* ── GET IN TOUCH FORM ── */}
      <ContactForm />

    </main>
  );
}
