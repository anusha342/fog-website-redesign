'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ContactForm from '@/components/ContactForm';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import styles from './page.module.css';
import type { Testimonial } from '@/lib/testimonials';

/* ── LENIS SMOOTH SCROLL ── */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = () => resolve(); s.onerror = reject;
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
    return () => {
      cancelAnimationFrame(animId);
      (window as any).__fogLenis?.destroy?.();
    };
  }, []);
}

/* ── SCROLL REVEAL ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const delay = (e.target as HTMLElement).dataset.revealDelay || '0';
            (e.target as HTMLElement).style.transitionDelay = `${delay}s`;
            e.target.classList.add('revealed');
            e.target.classList.add('is-revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── NAV THEME OBSERVER ── */
function useNavTheme() {
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = (entry.target as HTMLElement).dataset.navTheme || 'dark';
            navbar.setAttribute('data-theme', theme);
          }
        });
      },
      { threshold: 0.4, rootMargin: '-60px 0px 0px 0px' }
    );
    document.querySelectorAll('[data-nav-theme]').forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);
}

/* ── DATA ── */
const USPS_DATA = [
  {
    num: '01',
    category: 'Zero Downtime',
    title: '15-Minute Swaps. Zero Revenue Loss.',
    body: 'A wireless contact-free charging stand eliminates battery hassle, while a modular plug-and-play design with locally stocked, in-house spares enables 15-minute component swaps to ensure your arena never loses revenue.',
    img: '/images/laser-tag/gun.png',
  },
  {
    num: '02',
    category: 'Arena Design',
    title: 'Custom Arenas Built for Repeat Bookings.',
    body: 'Custom 3D-engineered layouts with ramps and tunnels maximize space and safety, while interactive Shooting Points and Homebases compel corporate teams, families, and friends to book repeat sessions.',
    img: '/images/laser-tag/arena.png',
  },
  {
    num: '03',
    category: 'Operator First',
    title: 'Operator-First Software. Zero Extra Cost.',
    body: 'Eliminate recurring overhead costs with an operator-friendly software suite that includes free lifetime updates, backed by a dedicated center engineer providing instant troubleshooting and mandatory daily checks.',
    img: '/images/laser-tag/vest-description.png',
  },
];

const MODES = [
  {
    name: 'Team Deathmatch',
    desc: 'Split into rival squads. Coordinate cover, communicate target locations, and rack up the most points before time runs out. True battlefield synergy is your only path to victory.',
    stats: 'Players: 8 – 30  |  Goal: Team Supremacy  |  Difficulty: Recruit',
    img: '/images/laser-tag/modes/team-death-match.png',
  },
  {
    name: 'Solo Deathmatch',
    desc: 'A ruthless, free-for-all tactical simulation. No squads, no allies, and no second chances. Rely strictly on your instincts and reflexes to outlast everyone in the arena.',
    stats: 'Players: 2 – 30  |  Goal: Last Agent Standing  |  Difficulty: Special Ops',
    img: '/images/laser-tag/modes/solo-death-match.png',
  },
  {
    name: 'Save the President',
    desc: "High-stakes escort mission. One squad defends a VIP designated 'The President' and guides them to safety, while the opposing squad attempts interception at all costs.",
    stats: 'Players: 6 – 30  |  Goal: VIP Extraction  |  Difficulty: Commander',
    img: '/images/laser-tag/modes/save-the-president.png',
  },
];

const MOMENTS = [
  {
    label: 'Suit Up & Play',
    title: 'Suit up & enter the arena',
    desc: 'Gear up with combat vests and phasers, select your game mode, and start the battle.',
    tags: ['Under 2 min setup', 'Up to 30 players'],
    img: '/images/laser-tag/laser-tag-1.png',
    imgAlt: 'Players suiting up in laser tag arena',
  },
  {
    label: 'AI Captures You',
    title: 'AI captures every highlight',
    desc: 'Overhead AI cameras automatically detect and record key eliminations, streaks, and victories.',
    tags: ['Auto-clip', 'Real-time', 'Zero setup'],
    img: '/images/laser-tag/arena.png',
    imgAlt: 'AI cameras tracking every move in the arena',
  },
  {
    label: 'Scan QR Code',
    title: 'Scan QR, claim your clip',
    desc: 'Scan the QR code at the arena exit to claim your personal highlight reel instantly.',
    tags: ['No app needed', 'Instant access'],
    img: '/images/laser-tag/vest-description.png',
    imgAlt: 'QR code scanning at exit kiosk',
  },
  {
    label: 'Download & Share',
    title: 'Download & share instantly',
    desc: 'Download your automated gameplay video and share it instantly to Instagram or WhatsApp.',
    tags: ['1-tap share', 'Viral ready'],
    img: '/images/laser-tag/gun.png',
    imgAlt: 'Sharing highlight clip on phone',
  },
];

/* ── MOMENT CARD COMPONENT ── */
function MomentCard({ step, idx }: { step: typeof MOMENTS[0]; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 2;
    const py = (y / rect.height - 0.5) * 2;
    const maxRotation = 8;
    const rx = -py * maxRotation;
    const ry = px * maxRotation;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.25, 1.25, 1.25)`;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.setProperty('--opacity', '1');
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.setProperty('--opacity', '0');
  };

  return (
    <div
      ref={cardRef}
      className={styles.momentsCard}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`Step ${idx + 1}: ${step.label}`}
    >
      <div className={`${styles.momentsCardBg} ${styles.momentsCardBgCover}`}>
        <Image
          src={step.img}
          alt={step.imgAlt}
          fill
          loading="lazy"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className={`${styles.momentsCardBg} ${styles.momentsCardBgContain}`}>
        <Image
          src={step.img}
          alt={step.imgAlt}
          fill
          loading="lazy"
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className={styles.momentsCardOverlay} aria-hidden="true" />
      <div className={styles.momentsHoloOverlay} aria-hidden="true" />
      <div className={styles.momentsHoloScanline} aria-hidden="true" />
      <span className={styles.momentsCardWatermark} aria-hidden="true">0{idx + 1}</span>
      <span className={styles.momentsCardStep} aria-hidden="true">[ • STEP 0{idx + 1} ]</span>
      <div className={styles.momentsCardContent}>
        <h3 className={styles.momentsCardTitle}>{step.title}</h3>
        <p className={styles.momentsCardDesc}>{step.desc}</p>
        <div className={styles.momentsCardTags}>
          {step.tags.map(t => (
            <span key={t} className={styles.momentsCardTag}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  testimonials: Testimonial[];
}

export default function LaserTagClient({ testimonials }: Props) {
  useLenis();
  useScrollReveal();
  useNavTheme();

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsVideoOpen(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  };

  const closeVideo = useCallback(() => {
    setIsVideoOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeVideo(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeVideo]);

  const [highlightSpecs, setHighlightSpecs] = useState(false);

  const handleViewSpecs = () => {
    document.getElementById('arena-bottom-panel')?.scrollIntoView({ behavior: 'smooth' });
    setHighlightSpecs(true);
    setTimeout(() => {
      setHighlightSpecs(false);
    }, 2000);
  };

  const [activeUsp, setActiveUsp] = useState(0);

  return (
    <main className={styles.lasertagPage}>

      {/* ── 1. HERO ── */}
      <header className={styles.hero} data-nav-theme="dark">
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/videos/lasertag-bg-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={`${styles.hudCorner} ${styles.hudCornerTl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudCornerTr}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudCornerBl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudCornerBr}`} aria-hidden="true" />

        <div className={styles.reticle} aria-hidden="true">
          <div className={styles.reticleRing} />
          <div className={`${styles.reticleCross} ${styles.reticleCrossH}`} />
          <div className={`${styles.reticleCross} ${styles.reticleCrossV}`} />
        </div>

        <div className={styles.heroScroll} aria-hidden="true">
          <div className={styles.heroScrollChevron} />
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow} data-reveal data-reveal-delay="0">Multi-Player Laser Combat</span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.12">Laser Tag</h1>
          <p className={styles.heroSub} data-reveal data-reveal-delay="0.22">Where strategy meets adrenaline.</p>
          <div className={styles.heroBtns} data-reveal data-reveal-delay="0.32">
            <button className={`${styles.hbtn} ${styles.hbtnSolid} ${styles.heroBtnWatch}`} onClick={openVideo}>
              &#x25B6;&nbsp; WATCH
            </button>
          </div>
        </div>

        {/* ── HERO STATS HUD — visible immediately, no scroll required ── */}
        <div className={styles.heroStats} aria-label="Laser Tag at a glance">
          <div className={styles.heroStatsTicker} aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.heroStatsTickerGroup}>
                <span>LASER TAG COMBAT SYSTEM</span>
                <span className={styles.heroStatsTickerDot} />
                <span>FOG TECHNOLOGIES</span>
                <span className={styles.heroStatsTickerDot} />
                <span>ARENA-GRADE EQUIPMENT</span>
                <span className={styles.heroStatsTickerDot} />
                <span>INDIA&apos;S PREMIUM LBE</span>
                <span className={styles.heroStatsTickerDot} />
              </div>
            ))}
          </div>
          <div className={styles.heroStatsGrid}>
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.4">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                <span className={styles.heroStatLabel}>Min. Age</span>
              </div>
              <span className={styles.heroStatNum}>7<span className={styles.heroStatUnit}>yrs</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.48">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className={styles.heroStatLabel}>Max Players</span>
              </div>
              <span className={styles.heroStatNum}>30</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.56">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
                <span className={styles.heroStatLabel}>Arena Area</span>
              </div>
              <span className={styles.heroStatNum}>2000<span className={styles.heroStatUnit}>sq ft</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.64">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><path d="M3 20h18" /></svg>
                <span className={styles.heroStatLabel}>ROI Period</span>
              </div>
              <span className={styles.heroStatNum}>24<span className={styles.heroStatUnit}>mo</span></span>
            </div>
          </div>
        </div>

        <div className={styles.heroQr} aria-hidden="true">
          <div className={styles.qrBox}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="8" y="8" width="8" height="8" fill="white" />
              <rect x="28" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="32" y="8" width="8" height="8" fill="white" />
              <rect x="4" y="28" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="8" y="32" width="8" height="8" fill="white" />
              <rect x="28" y="28" width="4" height="4" fill="white" />
              <rect x="36" y="28" width="4" height="4" fill="white" />
              <rect x="28" y="36" width="4" height="4" fill="white" />
              <rect x="36" y="36" width="4" height="4" fill="white" />
              <rect x="32" y="32" width="4" height="4" fill="white" />
            </svg>
          </div>
          <span className={styles.qrLabel}>Scan Me</span>
        </div>
      </header>

      {/* ── VIDEO MODAL ── */}
      <div
        className={`${styles.videoModal} ${isVideoOpen ? styles.open : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}
      >
        <div className={styles.videoContainer}>
          <button className={styles.videoClose} onClick={closeVideo}>&#x2715; Close</button>
          <video ref={videoRef} controls>
            <source src="/videos/clip1.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* ── 2. WHY FOG'S LASER TAG ── */}
      <section id="why-fog-lasertag" className={styles.uspSection} data-nav-theme="light">
        <div className={styles.uspHeader} data-reveal>
          <h2 className={styles.uspTitle}>WHY FOG'S LASER TAG</h2>
        </div>
        <div className={styles.uspInner}>
          <div className={styles.uspCarouselGrid}>

            {/* Left — interactive selectors */}
            <div className={styles.uspSelectorsPane} data-reveal>
              {USPS_DATA.map((usp, idx) => (
                <div
                  key={idx}
                  className={`${styles.uspSelectorCard} ${activeUsp === idx ? styles.uspSelectorActive : ''}`}
                  onMouseEnter={() => setActiveUsp(idx)}
                  onClick={() => setActiveUsp(idx)}
                >
                  <div className={styles.uspSelectorAccentLine} />
                  <div className={styles.uspSelectorContent}>
                    <div className={styles.uspSelectorHeader}>
                      <span className={styles.uspSelectorNum}>{usp.num}</span>
                      <span className={styles.uspSelectorCategory}>{usp.category}</span>
                    </div>
                    <h3 className={styles.uspSelectorTitle}>{usp.title.toUpperCase()}</h3>
                    <p className={styles.uspSelectorDesc}>{usp.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — photo showcase */}
            <div className={styles.uspShowcasePane} data-reveal data-reveal-delay="0.1">
              <div className={styles.uspShowcaseGrid}>
                {USPS_DATA.map((usp, idx) => (
                  <div
                    key={idx}
                    className={`${styles.uspImageItem} ${activeUsp === idx ? styles.uspImageActive : ''}`}
                  >
                    <Image
                      src={usp.img}
                      alt={usp.category}
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 900px) 100vw, 50vw"
                    />
                    <div className={styles.uspImageScanline} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. GUN + VEST DESCRIPTION ── */}
      <section id="equipment" className={styles.equipSection} data-nav-theme="light">
        <div className={styles.equipHeader} data-reveal>
          <h2 className={styles.equipTitle}>COMBAT EQUIPMENT</h2>
        </div>
        <div className={styles.equipInner}>
          <div className={styles.equipGrid}>

            {/* Phaser Card */}
            <div className={styles.equipCard} data-reveal>
              <div className={styles.equipCardImgWrap}>
                <Image
                  src="/images/laser-tag/gun-description.png"
                  alt="FOG Laser Tag Combat Phaser gun"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 900px) 100vw, 540px"
                />
              </div>
              <div className={styles.equipCardInfo}>
                <span className={styles.equipCardCategory}>Hardware</span>
                <h3 className={styles.equipCardTitle}>Combat Phaser</h3>
              </div>
              <div className={styles.equipOverlay}>
                <h4 className={styles.equipOverlayTitle}>Combat Phaser</h4>
                <div className={styles.equipOverlayDivider} />
                <ul className={styles.equipOverlayFeatures}>
                  <li>Ergonomic lightweight build</li>
                  <li>Wireless contact-free charging</li>
                  <li>Long-range precision targeting</li>
                  <li>Multi-colour LED hit indicators</li>
                  <li>Modular plug-and-play internals</li>
                </ul>
              </div>
            </div>

            {/* Vest Card */}
            <div className={styles.equipCard} data-reveal data-reveal-delay="0.15">
              <div className={styles.equipCardImgWrap}>
                <Image
                  src="/images/laser-tag/vest.png"
                  alt="FOG Laser Tag Tactical Vest with sensor zones"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 900px) 100vw, 540px"
                />
              </div>
              <div className={styles.equipCardInfo}>
                <span className={styles.equipCardCategory}>Protection</span>
                <h3 className={styles.equipCardTitle}>Tactical Vest</h3>
              </div>
              <div className={styles.equipOverlay}>
                <h4 className={styles.equipOverlayTitle}>Tactical Vest</h4>
                <div className={styles.equipOverlayDivider} />
                <ul className={styles.equipOverlayFeatures}>
                  <li>360° multi-zone impact sensors</li>
                  <li>Front, back &amp; shoulder coverage</li>
                  <li>LED full-body hit feedback</li>
                  <li>Adjustable fit — all ages</li>
                  <li>Durable arena-grade construction</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. GAME MODES ── */}
      <section id="game-modes" className={styles.modesSection} data-nav-theme="light">
        {/* Heading sits on white background, outside the gray panel */}
        <div className={styles.modesHeader} data-reveal>
          <h2 className={styles.modesTitle}>GAME MODES</h2>
        </div>

        {/* Gray panel — same as USP and Equipment sections */}
        <div className={styles.modesInner}>
          {/* Horizontal accordion — same cinematic pattern as other sections */}
          <div className={styles.modesAccordion}>
            {MODES.map((m, idx) => (
              <div
                key={idx}
                className={styles.modesAccCard}
                data-reveal
                data-reveal-delay={idx * 0.15}
              >
                {/* Background image — grayscale by default, full color on hover */}
                <div className={styles.modesAccImgWrap}>
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                </div>

                {/* Dark gradient overlay */}
                <div className={styles.modesAccOverlay} aria-hidden="true" />

                {/* Top header — number + name, always visible */}
                <div className={styles.modesAccHeader}>
                  <span className={styles.modesAccNum}>0{idx + 1}</span>
                  <h3 className={styles.modesAccName}>{m.name.toUpperCase()}</h3>
                  {idx === 2 && <span className={styles.modesAccNew}>NEW</span>}
                </div>

                {/* Bottom briefing — slides up on hover */}
                <div className={styles.modesAccContent}>
                  <span className={styles.modesAccTag}>Tactical Simulation</span>
                  <h4 className={styles.modesAccTitle}>{m.name}</h4>
                  <p className={styles.modesAccDesc}>{m.desc}</p>
                  <div className={styles.modesAccStats}>{m.stats}</div>
                  <button
                    className={styles.modesAccBtn}
                    onClick={openVideo}
                    aria-label={`Watch ${m.name} gameplay video`}
                  >
                    <svg
                      width="12" height="12" viewBox="0 0 14 14" fill="none"
                      aria-hidden="true"
                      style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}
                    >
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5.5 4.8l4 2.2-4 2.2V4.8z" fill="currentColor" />
                    </svg>
                    Watch Briefing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. MOMENTS IN LASER TAG ── */}
      <section
        id="lt-moments"
        className={styles.momentsSection}
        data-nav-theme="light"
      >

        {/* Header */}
        <div className={styles.momentsHeader} data-reveal>
          <div className={styles.momentsHeaderLeft}>
            <span className={styles.momentsEyebrow}>05 — Moments AI</span>
            <h2 className={styles.momentsTitle}>Moments in Laser Tag</h2>
          </div>
        </div>

        {/* Cinematic grid container */}
        <div className={styles.momentsGridContainer}>
          <div className={styles.momentsGrid}>
            {MOMENTS.map((step, idx) => (
              <MomentCard key={idx} step={step} idx={idx} />
            ))}
          </div>
        </div>

      </section>

      {/* ── 6. ARENA DESIGN ── */}
      <section id="arena-design" className={styles.arenaSection} data-nav-theme="dark" data-reveal>

        {/* Full-bleed background */}
        <div className={styles.arenaBg} aria-hidden="true">
          <Image
            src="/images/laser-tag/arena.png"
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
            priority={false}
          />
          <div className={styles.arenaOverlay} />
        </div>

        {/* Blueprint grid */}
        <div className={styles.arenaBlueprintGrid} aria-hidden="true" />

        {/* Laser sweep */}
        <div className={styles.arenaLaserLine} aria-hidden="true" />

        {/* HUD corners */}
        <div className={styles.arenaHudTl} aria-hidden="true" />
        <div className={styles.arenaHudTr} aria-hidden="true" />
        <div className={styles.arenaHudBl} aria-hidden="true" />
        <div className={styles.arenaHudBr} aria-hidden="true" />

        {/* Radar */}
        <div className={styles.arenaRadar} aria-hidden="true">
          <div className={styles.arenaRadarRing} />
          <div className={styles.arenaRadarRing} />
          <div className={styles.arenaRadarRing} />
          <div className={styles.arenaRadarSweep} />
          <div className={styles.arenaRadarCross} />
        </div>

        {/* Content column */}
        <div className={styles.arenaContent}>

          {/* TOP: eyebrow + single-line heading + description + CTA */}
          <div className={styles.arenaTopBar} data-reveal>
            <span className={styles.arenaEyebrow}>06 — Arena Design</span>
            <h2 className={styles.arenaTitle}>IMMERSIVE ARENA DESIGN</h2>
            <p className={styles.arenaDesc}>
              Every arena is a custom 3D-engineered battleground. Ramps, tunnels, cover walls —
              designed for maximum engagement and repeat bookings.
            </p>
            <button
              className={styles.arenaCtaBtn}
              onClick={handleViewSpecs}
            >
              VIEW SPECS <span className={styles.arenaCtaBtnArrow}>➔</span>
            </button>
          </div>

          {/* Spacer — shows image through */}
          <div className={styles.arenaMiddleSpacer} aria-hidden="true" />

          {/* BOTTOM: full-width HUD data strip */}
          <div id="arena-bottom-panel" className={styles.arenaBottomPanel} data-reveal data-reveal-delay="0.18">
            <div className={styles.arenaSpecGrid}>

              {/* 5 metric columns */}
              {[
                { val: '700–3000', unit: 'sq ft', label: 'Arena Size', bar: 82 },
                { val: '2–24', unit: 'players', label: 'Capacity', bar: 75 },
                { val: '100', unit: 'm', label: 'Tagger Range', bar: 95 },
                { val: '5–20', unit: 'min', label: 'Session', bar: 68 },
                { val: '8+', unit: 'hrs', label: 'Battery', bar: 88 },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`${styles.arenaSpecCol} ${highlightSpecs ? styles.arenaSpecColHighlighted : ''}`}
                >
                  {i > 0 && <span className={styles.arenaColDiv} aria-hidden="true" />}
                  <span className={styles.arenaSpecVal}>{s.val}</span>
                  <span className={styles.arenaSpecUnit}>{s.unit}</span>
                  <span className={styles.arenaSpecLabel}>{s.label}</span>
                  <div className={styles.arenaSpecTrack}>
                    <div
                      className={styles.arenaSpecFill}
                      style={{ '--bar-width': `${s.bar}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}

              {/* Accent divider before feature cols */}
              <span className={`${styles.arenaColDiv} ${styles.arenaColDivAccent}`} aria-hidden="true" />

              {/* Game Modes */}
              <div className={styles.arenaFeatureCol}>
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M10 2L4 10h5l-1 6 7-10h-5l1-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.arenaFeatureTitle}>Game Modes</span>
                <span className={styles.arenaFeatureText}>TDM · Solo · Save the President</span>
              </div>

              {/* Equipment */}
              <div className={styles.arenaFeatureCol}>
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="10" y="2" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="10" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="10" y="10" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className={styles.arenaFeatureTitle}>Equipment</span>
                <span className={styles.arenaFeatureText}>Combat Phaser · 8-zone haptic vests</span>
              </div>

            </div>
          </div>

        </div>

        {/* Footer bar */}
        <div className={styles.arenaFooter} aria-hidden="true">
          <div className={styles.arenaFooterLine} />
          <span className={styles.arenaFooterLabel}>FOG TECHNOLOGIES — COMBAT ARENA SYSTEM</span>
          <div className={styles.arenaFooterLine} />
        </div>

      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ── 9. CONTACT FORM ── */}
      <ContactForm defaultProduct="lasertag" />

    </main>
  );
}
