'use client';

import { useEffect, useState, useRef } from 'react';
import ContactForm from '@/components/ContactForm';
import type { PostMeta } from '@/lib/blog';
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

interface ContactClientProps {
  latestAnnouncement?: PostMeta | null;
}

export default function ContactClient({ latestAnnouncement }: ContactClientProps) {
  useLenis();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subMessage, setSubMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus('loading');
    setSubMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSubStatus('success');
        setSubMessage(data.message || 'Subscribed successfully!');
        setSubEmail('');
      } else {
        setSubStatus('error');
        setSubMessage(data.error || 'Failed to subscribe.');
      }
    } catch (err) {
      console.error(err);
      setSubStatus('error');
      setSubMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVideoMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleVideoMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

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
        <div className={styles.heroInner}>

          {/* Left Column */}
          <div className={styles.heroLeft} data-reveal>
            <h1 className={styles.heroTitle}>
              Every Great Journey Starts with a <span className={styles.gradientText}>Conversation</span>
            </h1>
            <div className={styles.heroBtns}>
              <a href="#get-in-touch" className={styles.btnSolid}>
                Contact Us <span className={styles.arrow}>&rsaquo;</span>
              </a>
              <div 
                className={styles.callButtonWrapper}
                onMouseEnter={() => setIsCallOpen(true)}
                onMouseLeave={() => setIsCallOpen(false)}
              >
                <button 
                  className={styles.btnOutline}
                  onClick={() => setIsCallOpen(!isCallOpen)}
                  aria-expanded={isCallOpen}
                  aria-haspopup="true"
                  type="button"
                >
                  Give Us A Call <span className={styles.arrow}>&rsaquo;</span>
                </button>
                {isCallOpen && (
                  <div className={styles.callDropdown}>
                    <a href="tel:+919998209033" className={styles.dropdownItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>Call Now</span>
                    </a>
                    <a href="https://wa.me/919998209033" target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownIcon}>
                        <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.214 8.214 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.177 8.177 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.66.83-.81.99-.15.17-.3.19-.55.07-1.09-.55-1.81-.92-2.52-2.14-.19-.32-.19-.55.01-.75.18-.18.4-.47.6-.7.2-.23.27-.39.41-.65.13-.26.07-.49-.03-.7-.1-.21-.88-2.13-1.21-2.92-.32-.77-.64-.66-.88-.68-.22-.01-.48-.01-.74-.01-.26 0-.68.1-1 .44-.33.34-1.26 1.24-1.26 3.02s1.3 3.5 1.48 3.75c.19.25 2.56 3.9 6.2 5.48.86.37 1.54.6 2.07.76.87.27 1.66.24 2.28.14.69-.1 2.13-.87 2.43-1.72.3-1 .3-1.86.21-2.02-.09-.17-.3-.27-.55-.39z" />
                      </svg>
                      <span>WhatsApp Us</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className={styles.heroRight} data-reveal data-reveal-delay="0.15">
            <div
              className={styles.videoWrapper}
              onClick={togglePlay}
              onMouseEnter={handleVideoMouseEnter}
              onMouseLeave={handleVideoMouseLeave}
              role="button"
              aria-label="Toggle video play/pause"
            >
              <video
                ref={videoRef}
                src="/videos/Contact-Us/ContactUsVideo.mp4"
                className={styles.heroVideo}
                loop
                muted
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className={`${styles.playPauseOverlay} ${!isPlaying ? styles.isPaused : ''}`}>
                <button className={styles.playPauseBtn} aria-label={isPlaying ? 'Pause video' : 'Play video'}>
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="4" width="4" height="16" />
                      <rect x="15" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateX(1.5px)' }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* ── LOCATION MAP ── */}
      <section id="our-location" className={styles.mapSection} aria-label="Our location on the map">
        <div className={styles.mapInner}>

          {/* Left — map panel */}
          <div className={styles.mapFrame}>
            <iframe
              src="https://maps.google.com/maps?q=FOG+Technologies,+D-203,+Aagam+Shopping+World,+Vesu+Canal+Rd,+Near+Agarwal+School,+Surat,+Gujarat+395007&z=17&iwloc=&output=embed"
              title="FOG Technologies office location — Surat, Gujarat"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.mapIframe}
            />
          </div>

          {/* Right — location photo card */}
          <div
            className={styles.mapRight}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src="/images/contact/FOG Location.png"
              alt="FOG Technologies location"
              className={styles.mapPhoto}
            />
            <div className={styles.mapOverlay} />
            <div className={styles.mapInfo}>
              <div className={styles.mapInfoCenter}>
                <h3 className={styles.mapInfoTitle}>Our Location</h3>
                <div className={styles.mapAddress}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>D-203, Aagam Shopping World,<br />Vesu Canal Rd, Surat, Gujarat 395007</span>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=FOG+Technologies,+D-203,+Aagam+Shopping+World,+Vesu+Canal+Rd,+Surat,+Gujarat+395007"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapBtn}
              >
                Get Directions
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── ANNOUNCEMENTS & NEWSLETTER SECTION ── */}
      <section className={styles.updateSection} aria-label="Announcements and Newsletter subscription">
        <div className={styles.updateInner}>
          
          {/* Left card: Latest announcement or generic promo */}
          <div className={styles.updateCard} data-reveal>
            {latestAnnouncement ? (
              <>
                <div className={styles.updateCardMedia}>
                  {latestAnnouncement.coverImage ? (
                    <img 
                      src={latestAnnouncement.coverImage} 
                      alt={latestAnnouncement.title} 
                      className={styles.updateCardImg}
                    />
                  ) : (
                    <div className={styles.updateCardImgPlaceholder} />
                  )}
                  <span className={styles.cardTag}>NEW UPDATE</span>
                </div>
                <div className={styles.updateCardBody}>
                  <h3 className={styles.updateCardTitle}>{latestAnnouncement.title}</h3>
                  <p className={styles.updateCardExcerpt}>{latestAnnouncement.excerpt}</p>
                  <a href={`/blog/${latestAnnouncement.slug}`} className={styles.updateCardBtn}>
                    Read Announcement <span className={styles.btnArrow}>&rsaquo;</span>
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className={styles.updateCardMedia}>
                  <img 
                    src="/images/Blog/blog3.jpeg" 
                    alt="FOG Technologies Blog" 
                    className={styles.updateCardImg}
                  />
                </div>
                <div className={styles.updateCardBody}>
                  <h3 className={styles.updateCardTitle}>Request a Quote for HyperGrid</h3>
                  <p className={styles.updateCardExcerpt}>
                    Learn more about the Future of Location-Based Entertainment and how our premium attractions fit your business model!
                  </p>
                  <a href="#get-in-touch" className={styles.updateCardBtn}>
                    Contact Us! <span className={styles.btnArrow}>&rsaquo;</span>
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Right card: Subscription Form */}
          <div className={`${styles.updateCard} ${styles.subscribeCard}`} data-reveal data-reveal-delay="0.15">
            <div className={styles.subscribeBgGlow} />
            <div className={styles.subscribeContent}>
              <h3 className={styles.subscribeTitle}>
                Get the Best Updates and Announcements in your inbox!
              </h3>
              <p className={styles.subscribeDesc}>
                Sign up with your email to receive direct updates whenever we publish new products, features, and blog announcements.
              </p>
              
              <form onSubmit={handleSubscribe} className={styles.subscribeForm} noValidate>
                <div className={styles.subscribeFormGroup}>
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    disabled={subStatus === 'loading'}
                    className={styles.subscribeInput}
                  />
                  <button 
                    type="submit" 
                    disabled={subStatus === 'loading'}
                    className={styles.subscribeSendBtn}
                    aria-label="Subscribe"
                  >
                    {subStatus === 'loading' ? (
                      <div className={styles.spinner} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </div>
              </form>

              {subMessage && (
                <div className={`${styles.subscribeMsg} ${subStatus === 'success' ? styles.subMsgSuccess : styles.subMsgError}`}>
                  {subMessage}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── GET IN TOUCH FORM ── */}
      <ContactForm />

    </main>
  );
}
