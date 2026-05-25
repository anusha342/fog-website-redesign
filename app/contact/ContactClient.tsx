'use client';

import { useEffect } from 'react';
import ContactForm from '@/components/ContactForm';
import styles from './contact.module.css';

export default function ContactClient() {
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
      <ContactForm />

    </main>
  );
}
