'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

const STEPS = [
  { name: 'Suit Up', desc: 'Players gear up with combat vests and laser guns. Ready to battle in under 2 minutes.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Select Game Mode', desc: 'Choose from Team Deathmatch, Solo Deathmatch, or Save the President at the kiosk.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Enter & Battle', desc: 'Players enter the arena and battle begins. Moments AI captures every highlight automatically.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Share & Return', desc: 'Review your score, claim your highlight clip, and challenge your squad to a rematch.', img: '/images/laser-tag/laser-tag-1.png' },
];

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

  const [activeStep, setActiveStep] = useState(0);
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
            <button
              className={`${styles.hbtn} ${styles.hbtnSolid}`}
              onClick={() => document.getElementById('why-fog-lasertag')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore &#x2192;
            </button>
            <button className={`${styles.hbtn} ${styles.hbtnGhost} ${styles.heroBtnWatch}`} onClick={openVideo}>
              &#x25B6;&nbsp; Video
            </button>
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

      {/* ── QUICK STATS ── */}
      <section className={styles.quickStats} aria-label="Laser Tag at a glance">
        <div className={styles.quickStatsInner}>

          <div className={styles.statCard} data-reveal data-reveal-delay="0">
            <div className={styles.statIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="16" y1="11" x2="22" y2="11" />
              </svg>
            </div>
            <span className={styles.statNum}>7</span>
            <span className={styles.statLabel}>Minimum Age</span>
          </div>

          <div className={styles.statCard} data-reveal data-reveal-delay="0.1">
            <div className={styles.statIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className={styles.statNum}>30</span>
            <span className={styles.statLabel}>Max Players</span>
          </div>

          <div className={styles.statCard} data-reveal data-reveal-delay="0.2">
            <div className={styles.statIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="0" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            </div>
            <span className={styles.statNum}>2000</span>
            <span className={styles.statLabel}>Area Required (sq ft)</span>
          </div>

          <div className={styles.statCard} data-reveal data-reveal-delay="0.3">
            <div className={styles.statIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <path d="M3 20h18" />
              </svg>
            </div>
            <span className={styles.statNum}>24</span>
            <span className={styles.statLabel}>ROI Months</span>
          </div>

        </div>
      </section>

      {/* ── 5. MOMENTS IN LASER TAG ── */}
      <section id="lt-moments" className={styles.momentsSection} data-nav-theme="light">
        <div className={styles.momentsInner}>
          <div className={styles.momentsTop} data-reveal>
            <h2 className={styles.momentsTitle}>Moments in Laser Tag</h2>
          </div>

          <div className={styles.momentsBento}>

            {/* Step 1 */}
            <div className={styles.momentsStep} data-reveal data-reveal-delay="0.1">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true" />
                <span className={styles.momentsStepText}>Step 01</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
                <div className={styles.momentsCardVisual}>
                  <Image src="/images/laser-tag/laser-tag-1.png" alt="Laser Tag arena" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className={styles.momentsCardBody}>
                  <h3 className={styles.momentsCardH}>Play in arena</h3>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`${styles.momentsStep} ${styles.momentsStepOffset}`} data-reveal data-reveal-delay="0.2">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true" />
                <span className={styles.momentsStepText}>Step 02</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
                <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyFull}`}>
                  <h3 className={styles.momentsCardH}>Scan Qr Code for getting moments</h3>
                  <div className={styles.momentsAvatars}>
                    <span className={styles.momentsAvatar}>TD</span>
                    <span className={styles.momentsAvatar}>SD</span>
                    <span className={styles.momentsAvatar}>SP</span>
                  </div>
                  <div className={styles.momentsChecklist}>
                    <p className={styles.momentsChecklistTitle}>Player Journey</p>
                    {[
                      { label: 'Book session & gear up', done: true },
                      { label: 'Select game mode at kiosk', done: true },
                      { label: 'AI capture starts on entry', done: true },
                      { label: 'Highlight clip delivered instantly', done: false },
                      { label: 'Leaderboard rank updated', done: false },
                    ].map((item, i) => (
                      <div key={i} className={`${styles.momentsCheck} ${item.done ? styles.momentsCheckDone : ''}`}>
                        <span className={`${styles.momentsCheckIcon} ${item.done ? '' : styles.momentsCheckIconEmpty}`}>
                          {item.done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.momentsStep} data-reveal data-reveal-delay="0.3">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true" />
                <span className={styles.momentsStepText}>Step 03</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardDark}`}>
                <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyCenter}`}>
                  <div className={styles.momentsIconCircle} aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 8v10M10 14.5l4 4.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className={styles.momentsCardEyebrow}>Shareable instantly</p>
                  <h3 className={styles.momentsCardH}>Video gets automatically downloaded</h3>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`${styles.momentsStep} ${styles.momentsStepOffset}`} data-reveal data-reveal-delay="0.4">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true" />
                <span className={styles.momentsStepText}>Step 04</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardAccent}`}>
                <div className={styles.momentsCardMedia}>
                  <Image src="/images/laser-tag/laser-tag-1.png" alt="Moments AI" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, mixBlendMode: 'luminosity' }} />
                </div>
                <div className={styles.momentsCardBody}>
                  <h3 className={styles.momentsCardH}>Sharable moments</h3>
                  <span className={styles.momentsBadge}>Real-Time Highlights</span>
                </div>
                <div className={styles.momentsMadeIn}>
                  <span>By FOG Technologies</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. ARENA DESIGN ── */}
      <section id="arena-design" className={styles.speModelSection} data-nav-theme="dark">
        <div className={styles.speModelInner}>
          <h2 className={styles.speModelTitle} data-reveal>Immersive Arena Design</h2>
          <div className={styles.speModelImgWrap} data-reveal data-reveal-delay="0.15">
            <Image
              src="/images/laser-tag/arena.png"
              alt="3D Laser Tag Arena Design"
              className={styles.speModelImg}
              width={1000}
              height={600}
              sizes="(max-width: 1000px) 100vw, 1000px"
            />
          </div>
        </div>
      </section>

      {/* ── 7. ARENA SPECS ── */}
      <section className={styles.speDataSection} data-nav-theme="dark">
        <div className={styles.speDataInner}>

          <div className={styles.speDimsCard} data-reveal>
            <h3 className={styles.speAreaTitle}>
              <span className={styles.speAreaLabel}>Area</span>
              <span className={styles.speAreaNum}>700–3000</span> sqft
            </h3>
            <div className={styles.speDimsTable}>
              <div className={styles.speDimsRow}><span>Players</span><span>2–24</span><span>per session</span></div>
              <div className={styles.speDimsRow}><span>Session</span><span>5–20 min</span><span>operator set</span></div>
              <div className={styles.speDimsRow}><span>Tagger Range</span><span>100 m</span><span>line of sight</span></div>
              <div className={styles.speDimsRow}><span>Battery</span><span>8+ hrs</span><span>continuous play</span></div>
            </div>
          </div>

          <div className={styles.speInfoCards} data-reveal data-reveal-delay="0.1">
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M10 2L4 10h6l-2 6 8-10h-6l2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.speInfoTitle}>Game Modes</span>
              </div>
              <p className={styles.speInfoText}>Team Deathmatch, Solo Deathmatch, Save the President — with more modes regularly added.</p>
            </div>
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="7" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="12" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="12" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="7" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="12" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className={styles.speInfoTitle}>Equipment</span>
              </div>
              <p className={styles.speInfoText}>Realistic laser guns + <strong>8-zone haptic vests</strong> with sub-10ms hit response time.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ── 9. CONTACT FORM ── */}
      <ContactForm defaultProduct="lasertag" />

    </main>
  );
}
