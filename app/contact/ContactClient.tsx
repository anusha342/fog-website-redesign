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
        {/* Centered text content */}
        <div className={styles.heroContent}>
          {/* <p className={styles.heroEyebrow}>Get In Touch</p> */}
          <h1 className={styles.heroTitle}>Contact Us</h1>
        </div>

        {/* Scroll cue */}
        {/* <div className={styles.heroScrollIndicator} aria-hidden="true">
          <div className={styles.heroScrollLine}>
            <div className={styles.heroScrollDot} />
          </div>
        </div> */}
      </header>

      {/* ── INFO STRIP ── */}
      <div className={styles.infoStrip} data-reveal>
        <div className={styles.infoInner}>

          {/* Email — left */}
          <a href="mailto:futureofgamingtech@gmail.com" className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoVal}>futureofgamingtech@gmail.com</span>
            </div>
          </a>

          <div className={styles.infoDivider} aria-hidden="true" />

          {/* Address — centre */}
          <div className={`${styles.infoCard} ${styles.infoCardCenter} ${styles.infoCardPlain}`}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Address</span>
              <span className={styles.infoVal}>Mumbai, Maharashtra, India</span>
            </div>
          </div>

          <div className={styles.infoDivider} aria-hidden="true" />

          {/* Phone — right */}
          <a href="tel:+919876543210" className={`${styles.infoCard} ${styles.infoCardRight}`}>
            <div className={styles.infoIcon} aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoVal}>+91 98765 43210</span>
            </div>
          </a>

        </div>
      </div>

      {/* ── GET IN TOUCH FORM ── */}
      <ContactForm />

    </main>
  );
}
