'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import ContactForm from '@/components/ContactForm';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FaqSection from '@/components/FaqSection';
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
      .catch(() => {});
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

const MODES = [
  { name: 'Escape the Lava',       img: '/images/hyper-grid/modes/escape-the-lava.jpg' },
  { name: 'Find that Color',       img: '/images/hyper-grid/modes/find-the-color.jpg' },
  { name: 'Sharp Shooter',         img: '/images/hyper-grid/modes/sharp-shooter.jpg' },
  { name: 'Red Light Green Light', img: '/images/hyper-grid/modes/red-light-green-light.jpg' },
  { name: 'Football',              img: '/images/hyper-grid/modes/football.png' },
];

const STEPS = [
  { name: 'Tap the Card',    desc: 'Comes integrated with your card reader / coin slot machine.',  img: '/images/hyper-grid/automated/card-1.png' },
  { name: 'Select the Game', desc: 'Use our touch operated software to select your game.',          img: '/images/hyper-grid/automated/card-2.png' },
  { name: 'Enter the Grid',  desc: 'Players enter the grid to start the tutorial video.',           img: '/images/hyper-grid/automated/card-3.png' },
  { name: 'Watch Tutorial',  desc: 'Learn how to play with our super simple tutorial videos.',      img: '/images/hyper-grid/automated/card-4.png' },
];

interface Props {
  testimonials: Testimonial[];
}

export default function HyperGridClient({ testimonials }: Props) {
  useLenis();
  useScrollReveal();

  /* ── Video modal ── */
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsVideoOpen(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      videoRef.current.muted = false;
    }
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isVideoOpen) closeVideo(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isVideoOpen]);

  /* ── Game Modes ── */
  const [activeMode, setActiveMode] = useState(0);

  /* ── How It Works — button-triggered sequential glide ── */
  const [processAnimStep, setProcessAnimStep] = useState(-1);
  const [processPlaying, setProcessPlaying] = useState(false);
  const processTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => { processTimersRef.current.forEach(clearTimeout); };
  }, []);

  function handleProcessPlay() {
    if (processPlaying) return;
    setProcessPlaying(true);
    setProcessAnimStep(-1);
    processTimersRef.current.forEach(clearTimeout);
    // BL(0) → TL(1) → TR(2) → BR(3), each 2 s, 3× glide distance
    processTimersRef.current = [
      setTimeout(() => setProcessAnimStep(0), 100),
      setTimeout(() => setProcessAnimStep(1), 2100),
      setTimeout(() => setProcessAnimStep(2), 4100),
      setTimeout(() => setProcessAnimStep(3), 6100),
      setTimeout(() => { setProcessAnimStep(4); setProcessPlaying(false); }, 8100),
    ];
  }

  /* ── ROI Calculator ── */
  const [floor,      setFloor]      = useState(50);
  const [footfall,   setFootfall]   = useState(500);
  const [hours,      setHours]      = useState(10);
  const [ticket,     setTicket]     = useState(150);
  const [conversion, setConversion] = useState(15);

  const productCost    = floor * 2500;
  const dailyPlayers   = footfall * (conversion / 100);
  const dailyRevenue   = dailyPlayers * ticket;
  const monthlyRevenue = dailyRevenue * 30;
  const yearlyRevenue  = monthlyRevenue * 12;
  const paybackMonths  = monthlyRevenue > 0 ? Math.ceil(productCost / monthlyRevenue) : 0;
  const fiveYearProfit = yearlyRevenue * 5 - productCost;
  const roi            = productCost > 0 ? (fiveYearProfit / productCost) * 100 : 0;

  const lineChartRef = useRef<any>(null);

  const updateChartData = useCallback(() => {
    if (!lineChartRef.current) return;
    lineChartRef.current.data.datasets[0].data = Array.from({ length: 60 }, (_, i) =>
      ((monthlyRevenue * (i + 1)) - productCost) / 100000
    );
    lineChartRef.current.update('none');
  }, [productCost, monthlyRevenue]);

  const initCharts = useCallback(() => {
    const Chart = (window as any).Chart;
    if (!Chart) return;

    const lineCanvas = document.getElementById('chart-cumulative') as HTMLCanvasElement | null;
    if (!lineCanvas) return;

    const existingLine = Chart.getChart(lineCanvas);
    if (existingLine) existingLine.destroy();

    const scales = {
      x: { grid: { color: 'rgba(19,19,19,0.05)' }, ticks: { color: 'rgba(19,19,19,0.4)', font: { size: 10, family: 'GoogleSans' } }, border: { display: false } },
      y: { grid: { color: 'rgba(19,19,19,0.05)' }, ticks: { color: 'rgba(19,19,19,0.4)', font: { size: 10, family: 'GoogleSans' }, callback: (v: any) => '₹' + v + 'L' }, border: { display: false } },
    };
    const plugins = {
      legend: { display: false },
      tooltip: { backgroundColor: '#131313', borderColor: 'rgba(19,19,19,0.15)', borderWidth: 1, titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.6)', padding: 12, callbacks: {
        label: (ctx: any) => '₹' + ctx.parsed.y.toFixed(1) + 'L',
        title: (ctx: any) => 'Month ' + (ctx[0].dataIndex + 1),
      }},
    };

    lineChartRef.current = new Chart(lineCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: Array.from({ length: 60 }, (_, i) => ((i + 1) % 12 === 0 ? 'Y' + ((i + 1) / 12) : '')),
        datasets: [{
          data: [],
          borderColor: '#F05023',
          borderWidth: 2.5,
          fill: { target: 'origin', above: 'rgba(240,80,35,0.07)', below: 'rgba(240,80,35,0)' },
          pointRadius: 0,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins,
        scales,
      },
    });

    updateChartData();
  }, [updateChartData]);

  /* Update chart data whenever inputs change */
  useEffect(() => {
    updateChartData();
  }, [updateChartData]);

  /* Cleanup charts on unmount */
  useEffect(() => {
    return () => { lineChartRef.current?.destroy(); };
  }, []);


  return (
    <main className={styles.hypergridPage}>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        strategy="lazyOnload"
        onLoad={initCharts}
      />

      {/* ── HERO ── */}
      <header className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/videos/hypergrid-bg-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>

        <div className={`${styles.hudCorner} ${styles.hudTl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudTr}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudBl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudBr}`} aria-hidden="true"></div>

        <div className={styles.heroScroll} aria-hidden="true">
          <div className={styles.heroScrollChevron}></div>
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow} data-reveal data-reveal-delay="0">LED Interactive Floor Gaming</span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.12">HyperGrid</h1>
          <p className={styles.heroSub} data-reveal data-reveal-delay="0.22">Where the floor becomes the game</p>
          <div className={styles.heroBtns} data-reveal data-reveal-delay="0.32">
            <button className={`${styles.hbtn} ${styles.hbtnSolid} ${styles.heroBtnWatch}`} onClick={openVideo}>
              &#x25B6;&nbsp; WATCH
            </button>
          </div>
        </div>

        {/* ── HERO STATS HUD — visible immediately, no scroll required ── */}
        <div className={styles.heroStats} aria-label="HyperGrid at a glance">
          <div className={styles.heroStatsGrid}>
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.4">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                <span className={styles.heroStatLabel}>Min. Age</span>
              </div>
              <span className={styles.heroStatNum}>4<span className={styles.heroStatUnit}>yrs</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.48">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className={styles.heroStatLabel}>Max Players</span>
              </div>
              <span className={styles.heroStatNum}>24</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.56">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
                <span className={styles.heroStatLabel}>Grid Area</span>
              </div>
              <span className={styles.heroStatNum}>400<span className={styles.heroStatUnit}>sq ft</span></span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStatItem} data-reveal data-reveal-delay="0.64">
              <div className={styles.heroStatTop}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><path d="M3 20h18" /></svg>
                <span className={styles.heroStatLabel}>ROI Period</span>
              </div>
              <span className={styles.heroStatNum}>18<span className={styles.heroStatUnit}>mo</span></span>
            </div>
          </div>
          <div className={styles.heroStatsTicker} aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.heroStatsTickerGroup}>
                <span>HYPERGRID LED PLAYGROUND</span>
                <span className={styles.heroStatsTickerDot} />
                <span>FOG TECHNOLOGIES</span>
                <span className={styles.heroStatsTickerDot} />
                <span>INTERACTIVE FLOOR GRID</span>
                <span className={styles.heroStatsTickerDot} />
                <span>INDIA&apos;S PREMIUM LBE</span>
                <span className={styles.heroStatsTickerDot} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── VIDEO MODAL ── */}
      <div
        className={`${styles.videoModal} ${isVideoOpen ? styles.videoModalOpen : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}
        role="dialog"
        aria-modal="true"
        aria-label="HyperGrid video player"
      >
        <div className={styles.videoContainer}>
          <button className={styles.videoClose} onClick={closeVideo} aria-label="Close video player">
            &#x2715; Close
          </button>
          <video ref={videoRef} controls>
            <source src="/videos/hypergrid-bg-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* ── WHAT IS HYPERGRID ── */}
      <section id="what-is-hypergrid" className={styles.whatSection}>
        <div className={styles.whatInner}>
          <h2 className={styles.whatHeading} data-reveal>What Is HyperGrid?</h2>
          <div className={styles.whatHeroImgWrap} data-reveal data-reveal-delay="0.08">
            <Image
              src="/images/hyper-grid/hyper-grid-6.png"
              alt="HyperGrid LED interactive floor gaming installation"
              className={styles.whatHeroImgEl}
              width={1600}
              height={668}
              sizes="100vw"
              priority
            />
          </div>
          <div className={styles.whatFrame} data-reveal data-reveal-delay="0.1">
            <span className={styles.whatFrameBadge} aria-hidden="true">Hyper Grid</span>
            <div className={styles.whatCards}>
              <div data-reveal data-reveal-delay="0.15">
                <div className={`${styles.whatCardWrap} ${styles.whatCardWrap1}`}>
                  <div className={styles.whatPolaroid}>
                    <Image
                      src="/images/hyper-grid/what-is-hypergrid/1st-card.png"
                      alt="HyperGrid arcade-style installation in a family entertainment venue"
                      className={styles.whatPolaroidImg}
                      width={792}
                      height={799}
                      sizes="(max-width: 767px) 90vw, 28vw"
                    />
                  </div>
                  <p className={styles.whatCardCaption}>Arcade Style Turnkey Attraction</p>
                </div>
              </div>
              <div data-reveal data-reveal-delay="0.25">
                <div className={`${styles.whatCardWrap} ${styles.whatCardWrap2}`}>
                  <div className={styles.whatPolaroid}>
                    <Image
                      src="/images/hyper-grid/what-is-hypergrid/2nd-card.png"
                      alt="Glowing color LED tiles of the HyperGrid floor"
                      className={styles.whatPolaroidImg}
                      width={789}
                      height={803}
                      sizes="(max-width: 767px) 90vw, 28vw"
                    />
                  </div>
                  <p className={styles.whatCardCaption}>Where Glowing Color Tiles Connect</p>
                </div>
              </div>
              <div data-reveal data-reveal-delay="0.35">
                <div className={`${styles.whatCardWrap} ${styles.whatCardWrap3}`}>
                  <div className={styles.whatPolaroid}>
                    <Image
                      src="/images/hyper-grid/what-is-hypergrid/3rd-card.png"
                      alt="Players enjoying games on the HyperGrid floor"
                      className={styles.whatPolaroidImg}
                      width={783}
                      height={799}
                      sizes="(max-width: 767px) 90vw, 28vw"
                    />
                  </div>
                  <p className={styles.whatCardCaption}>To Create a World of Games</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAME MODES ── */}
      <section id="game-modes" className={styles.modesV2Section}>
        <div className={styles.modesV2Wrap}>

          {/* Full-width header — matches whatHeading position */}
          <div className={styles.modesV2Header}>
            {/* <span className={styles.modesEyebrow} data-reveal>02 — Game Modes</span> */}
            <h2 className={styles.modesV2Title} data-reveal>Game Modes</h2>
          </div>

          {/* 60 / 40 body — fills remaining viewport height */}
          <div className={styles.modesV2Body}>

            {/* Left — image panel, 60% */}
            <div className={styles.modesV2Left}>
              <div className={styles.modesV2ImgWrap}>
                <Image
                  src={MODES[activeMode].img}
                  alt={MODES[activeMode].name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <button className={styles.modesVideoBtn} onClick={openVideo} aria-label="Watch HyperGrid gameplay video">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 4.8l4 2.2-4 2.2V4.8z" fill="currentColor"/>
                </svg>
                Watch Gameplay
              </button>
            </div>

            {/* Right — mode list, 40% */}
            <div className={styles.modesV2Right}>
              <div className={styles.modesV2Line}></div>
              {MODES.map((m, idx) => (
                <div key={idx}>
                  <div
                    className={`${styles.modeItem} ${activeMode === idx ? styles.modeItemActive : ''}`}
                    onMouseEnter={() => setActiveMode(idx)}
                  >
                    <h3 className={styles.modeItemName}>{m.name}</h3>
                    <span className={styles.modeItemNum}>0{idx + 1}</span>
                  </div>
                  <div className={styles.modesV2Line}></div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* ── MOMENTS BENTO ── */}
      <section id="hg-moments" className={styles.momentsSection}>
        <div className={styles.momentsInner}>
          <div className={styles.momentsTop} data-reveal>
            {/* <span className={styles.momentsEyebrow}>03 — Moments</span> */}
            <h2 className={styles.momentsTitle}>Moments in HyperGrid</h2>
          </div>

          <div className={styles.momentsBento}>

            {/* Step 1 */}
            <div className={styles.momentsCard} data-reveal data-reveal-delay="0.1">
              <div className={styles.momentsCardImg}>
                <Image src="/images/hyper-grid/hyper-grid-1.png" alt="HyperGrid floor in action" width={400} height={260} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
              </div>
              <div className={styles.momentsCardContent}>
                <span className={styles.momentsStepTag}>01</span>
                <h3 className={styles.momentsCardH}>Camera positions on HyperGrid</h3>
                <p className={styles.momentsCardP}>Overhead AI cameras auto-track every player across the grid.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`${styles.momentsCard} ${styles.momentsCardDark}`} data-reveal data-reveal-delay="0.2">
              <div className={styles.momentsCardContent}>
                <span className={styles.momentsStepTag}>02</span>
                <h3 className={styles.momentsCardH}>Play — AI captures your highlight</h3>
                <p className={styles.momentsCardP}>Every move is recorded in real-time. The AI auto-cuts your best 30-second clip during gameplay.</p>
                <ul className={styles.momentsList}>
                  <li>Tap to pay &amp; select game mode</li>
                  <li>Step on grid to begin</li>
                  <li>AI capture starts automatically</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`${styles.momentsCard} ${styles.momentsCardAccent}`} data-reveal data-reveal-delay="0.3">
              <div className={styles.momentsCardContent}>
                <span className={styles.momentsStepTag}>03</span>
                <h3 className={styles.momentsCardH}>Scan QR at exit</h3>
                <p className={styles.momentsCardP}>Walk out and scan the exit kiosk QR — your highlight clip is waiting instantly.</p>
                <span className={styles.momentsBadge}>No app needed</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className={styles.momentsCard} data-reveal data-reveal-delay="0.4">
              <div className={styles.momentsCardImg}>
                <Image src="/images/hyper-grid/hyper-grid-2.png" alt="HyperGrid gameplay highlight" width={400} height={260} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.momentsCardContent}>
                <span className={styles.momentsStepTag}>04</span>
                <h3 className={styles.momentsCardH}>Download &amp; share instantly</h3>
                <p className={styles.momentsCardP}>1-tap share to Instagram, WhatsApp, or TikTok — built-in viral loop for your venue.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.processSection}>

        {/* ── Header strip — separate from image ── */}
        <div className={styles.processHeaderWrap}>
          <div className={styles.processHeaderInner}>
            {/* <span className={styles.processEyebrow} data-reveal>04 — How It Works</span> */}
            <h2 className={styles.processTitle} data-reveal data-reveal-delay="0.1">
              Easy, Automated &amp; Operator-Free
            </h2>
            <p className={styles.processSub} data-reveal data-reveal-delay="0.15">
              Crowd-Pulling Profit Machine
            </p>
          </div>
        </div>

        {/* ── Photo canvas — constrained to 1440px ── */}
        <div className={styles.processCanvas}>
          <Image
            src="/images/hyper-grid/hyper-grid-6.png"
            alt="HyperGrid automated floor gaming system in action"
            fill
            className={styles.processBg}
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
          <div className={styles.processInner}>

          {/* dimmed = non-active units fade during playback */}
          {(() => {
            const dimming = processPlaying && processAnimStep >= 0 && processAnimStep < 4;
            const dim = (active: boolean) => dimming && !active ? styles.processUnitDimmed : '';
            return (
              <>
                {/* Step 02 — TOP LEFT — glides right */}
                <div className={`${styles.processUnit} ${styles.unitTopLeft} ${processAnimStep === 1 ? styles.animGlideRight : ''} ${dim(processAnimStep === 1)}`}>
                  <div className={styles.processBox}>
                    <span className={styles.boxStep}>Step 02</span>
                    <h3 className={styles.boxTitle}>Select the Game</h3>
                    <p className={styles.boxDesc}>Use our touch operated software to select your game.</p>
                  </div>
                  <div className={styles.arrowRight} aria-hidden="true">
                    <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
                      <polyline points="2,2 11,11 2,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 23,11 14,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 04 — TOP RIGHT — glides left */}
                <div className={`${styles.processUnit} ${styles.unitTopRight} ${processAnimStep === 2 ? styles.animGlideLeft : ''} ${dim(processAnimStep === 2)}`}>
                  <div className={styles.arrowLeft} aria-hidden="true">
                    <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
                      <polyline points="28,2 19,11 28,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,2 7,11 16,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.processBox}>
                    <span className={styles.boxStep}>Step 04</span>
                    <h3 className={styles.boxTitle}>Watch Tutorial</h3>
                    <p className={styles.boxDesc}>Learn how to play with our super simple tutorial videos.</p>
                  </div>
                </div>

                {/* Step 01 — BOTTOM LEFT — glides up */}
                <div className={`${styles.processUnit} ${styles.unitBottomLeft} ${processAnimStep === 0 ? styles.animGlideUp : ''} ${dim(processAnimStep === 0)}`}>
                  <div className={styles.processBox}>
                    <span className={styles.boxStep}>Step 01</span>
                    <h3 className={styles.boxTitle}>Tap the Card</h3>
                    <p className={styles.boxDesc}>Comes integrated with your card reader / coin slot machine.</p>
                  </div>
                  <div className={styles.arrowUp} aria-hidden="true">
                    <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
                      <polyline points="2,28 11,19 20,28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="2,16 11,7 20,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 03 — BOTTOM RIGHT — glides left */}
                <div className={`${styles.processUnit} ${styles.unitBottomRight} ${processAnimStep === 3 ? styles.animGlideLeft : ''} ${dim(processAnimStep === 3)}`}>
                  <div className={styles.arrowLeft} aria-hidden="true">
                    <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
                      <polyline points="28,2 19,11 28,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,2 7,11 16,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.processBox}>
                    <span className={styles.boxStep}>Step 03</span>
                    <h3 className={styles.boxTitle}>Enter the Grid</h3>
                    <p className={styles.boxDesc}>Players enter the grid to start the tutorial video.</p>
                  </div>
                </div>
              </>
            );
          })()}

          </div>{/* /processInner */}
        </div>{/* /processCanvas */}

        {/* ── Mobile/Tablet Steps Display ── */}
        <div className={styles.processMobileSteps}>
          {STEPS.map((step, idx) => (
            <div key={idx} className={styles.mobileStepCard}>
              <span className={styles.mobileStepNum}>Step 0{idx + 1}</span>
              <h3 className={styles.mobileStepTitle}>{step.name}</h3>
              <p className={styles.mobileStepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>


        {/* ── Click to Play — below photo, centered ── */}
        <div className={styles.processFooter}>
          <button
            className={`${styles.processPlayBtn}${processPlaying ? ' ' + styles.processPlayBtnPlaying : ''}`}
            onClick={handleProcessPlay}
            disabled={processPlaying}
          >
            {processPlaying ? 'Playing…' : processAnimStep === 4 ? 'Play Again' : 'Click to Play'}
            {!processPlaying && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <polygon points="2,1 11,6 2,11" />
              </svg>
            )}
          </button>
        </div>

      </section>

      {/* ── ROI CALCULATOR ── */}
      <section id="roi-calculator" className={styles.calcSection}>
        <div className={styles.calcWrap}>

          <div className={styles.calcHeader}>
            {/* <span className={styles.calcEyebrow} data-reveal>05 — ROI Calculator</span> */}
            <h2 className={styles.calcTitle} data-reveal data-reveal-delay="0.1">
              Your Returns, Calculated
            </h2>
          </div>

          <div className={styles.calcBody}>
            {/* Left: Inputs */}
            <div className={styles.calcInputs}>
              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Floor Area</label>
                  <span className={styles.calcVal}>{floor} sq ft</span>
                </div>
                <input type="range" className={styles.calcRange} min="25" max="200" value={floor} step="5"
                  onChange={(e) => setFloor(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>25</span><span>200 sq ft</span></div>
              </div>

              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Daily Footfall</label>
                  <span className={styles.calcVal}>{footfall}</span>
                </div>
                <input type="range" className={styles.calcRange} min="100" max="2000" value={footfall} step="50"
                  onChange={(e) => setFootfall(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>100</span><span>2,000</span></div>
              </div>

              <div className={styles.calcField}>
                <label className={styles.calcSelectLabel}>Operating Hours</label>
                <select className={styles.calcSelect} value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  <option value="8">8 hours / day</option>
                  <option value="10">10 hours / day</option>
                  <option value="12">12 hours / day</option>
                  <option value="16">16 hours / day</option>
                </select>
              </div>

              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Ticket Price</label>
                  <span className={styles.calcVal}>&#8377;{ticket}</span>
                </div>
                <input type="range" className={styles.calcRange} min="50" max="500" value={ticket} step="10"
                  onChange={(e) => setTicket(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>&#8377;50</span><span>&#8377;500</span></div>
              </div>

              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Conversion Rate</label>
                  <span className={styles.calcVal}>{conversion}%</span>
                </div>
                <input type="range" className={styles.calcRange} min="5" max="30" value={conversion}
                  onChange={(e) => setConversion(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>5%</span><span>30%</span></div>
              </div>
            </div>

            {/* Right: Output */}
            <div className={styles.calcOutput}>

              {/* KPI strip */}
              <div className={styles.calcKpis}>
                <div className={styles.calcKpi}>
                  <span className={styles.calcKpiLabel}>Total Investment</span>
                  <span className={styles.calcKpiVal}>&#8377;{(productCost / 100000).toFixed(1)}L</span>
                </div>
                <div className={styles.calcKpi}>
                  <span className={styles.calcKpiLabel}>Monthly Revenue</span>
                  <span className={`${styles.calcKpiVal} ${styles.calcKpiOrange}`}>&#8377;{(monthlyRevenue / 100000).toFixed(1)}L</span>
                </div>
                <div className={styles.calcKpi}>
                  <span className={styles.calcKpiLabel}>Payback Period</span>
                  <span className={`${styles.calcKpiVal} ${styles.calcKpiOrange}`}>{paybackMonths} mo</span>
                </div>
                <div className={`${styles.calcKpi} ${styles.calcKpiHero}`}>
                  <span className={styles.calcKpiLabel}>5-Year ROI</span>
                  <span className={`${styles.calcKpiVal} ${styles.calcKpiGreen}`}>{roi.toFixed(0)}%</span>
                </div>
              </div>

              {/* Chart */}
              <div className={styles.calcChartArea}>
                <div className={styles.calcChartMeta}>
                  <span className={styles.calcChartLabel}>5-Year Cumulative Profit</span>
                  {/* <span className={styles.calcChartNote}>Break-even when the line crosses zero</span> */}
                </div>
                <div className={styles.calcChartWrap}>
                  <canvas id="chart-cumulative"></canvas>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.calcFooter}>
            <p className={styles.calcDisclaimer}>
              Indicative estimates based on industry averages. Actual results vary by location and operations.
            </p>
            <Link href="/contact" className={`${styles.hbtn} ${styles.hbtnSolid}`}>
              Get a Detailed Proposal &nbsp;&#x2192;
            </Link>
          </div>
        </div>
      </section>

      {/* ── SPECS — MODEL ── */}
      <section id="specs-roi" className={styles.speModelSection}>
        <div className={styles.speModelInner}>
          <h2 className={styles.speModelTitle} data-reveal>Specifications</h2>
          <div className={styles.speModelImgWrap} data-reveal>
            <Image
              src="/images/hyper-grid/specs/specs-1.png"
              alt="HyperGrid 3D model with dimensions"
              className={styles.speModelImg}
              width={839}
              height={500}
              sizes="(max-width: 839px) 100vw, 839px"
            />
          </div>
        </div>
      </section>

      {/* ── SPECS — DATA ── */}
      <section className={styles.speDataSection}>
        <div className={styles.speDataInner}>
          <div className={styles.speDimsCard} data-reveal>
            <h3 className={styles.speAreaTitle}>
              <span className={styles.speAreaLabel}>Area</span>
              <span className={styles.speAreaNum}>270</span> sqft /&nbsp;
              <span className={styles.speAreaNum}>25</span> sqm
            </h3>
            <div className={styles.speDimsTable}>
              <div className={styles.speDimsRow}><span>Length</span><span>20.3 FT</span><span>6.4 M</span></div>
              <div className={styles.speDimsRow}><span>Depth</span><span>13.3 FT</span><span>4.1 M</span></div>
              <div className={styles.speDimsRow}><span>Height</span><span>9.2 FT</span><span>2.8 M</span></div>
            </div>
          </div>

          <div className={styles.speInfoCards} data-reveal data-reveal-delay="0.1">
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M10 2L4 10h6l-2 6 8-10h-6l2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={styles.speInfoTitle}>Power</span>
              </div>
              <p className={styles.speInfoText}>Average <strong>1.5 KW</strong> and Max 4.5 KW</p>
            </div>
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="7" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="12" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="2" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="12" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="2" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="7" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="12" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className={styles.speInfoTitle}>Structure</span>
              </div>
              <p className={styles.speInfoText}>Strong and safe, made with heavy gauge MS and plywood.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection
        lede="Common questions from venue owners and operators about the HyperGrid LED gaming floor."
        items={[
          {
            q: "How much floor space does HyperGrid need?",
            a: "The standard HyperGrid installation covers 270 sq ft (25 sqm) — 20.3 ft × 13.3 ft. The modular tile system means we can adapt the footprint to fit irregular or smaller spaces, with a practical minimum of around 150 sq ft for a functional play area.",
          },
          {
            q: "Can HyperGrid be installed on any existing floor?",
            a: "Yes. HyperGrid tiles sit on top of your existing floor with no permanent modifications. They are self-levelling on flat surfaces and require no adhesives or subfloor work. Installation typically completes in one day for a standard-sized arena.",
          },
          {
            q: "How many players can use HyperGrid simultaneously?",
            a: "HyperGrid supports up to 20 simultaneous players in team-vs-team modes, with the system dynamically partitioning the floor into zones. Solo, duo, and small-group modes are also available, making it versatile for all crowd sizes.",
          },
          {
            q: "What game modes are available?",
            a: "HyperGrid ships with over 12 built-in game modes including Step Battle, Team Zone, Reaction Sprint, and Dance Floor. The FOG Control Suite lets operators create and schedule custom modes without any coding. New modes are added with every software update.",
          },
          {
            q: "What does routine maintenance involve?",
            a: "HyperGrid is engineered for high-traffic commercial use. Daily maintenance is just a standard dry or damp mop. Sensor tiles are sealed to IP54 standard. FOG provides a remote diagnostic dashboard that flags any tile anomalies before they affect gameplay.",
          },
          {
            q: "What warranty and after-sales support do you offer?",
            a: "Every HyperGrid installation comes with a 2-year hardware warranty on tiles and sensor boards, lifetime software updates, and 24/7 technical support. On-site service visits are available within 72 hours across all major Indian cities.",
          },
        ]}
      />

      {/* ── TESTIMONIALS ── */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ── GET IN TOUCH ── */}
      <ContactForm defaultProduct="hypergrid" />
    </main>
  );
}
