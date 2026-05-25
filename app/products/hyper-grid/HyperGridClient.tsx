'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
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
            <a
              href="#what-is-hypergrid"
              className={`${styles.hbtn} ${styles.hbtnSolid}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('what-is-hypergrid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Dive &#x2192;
            </a>
            <button className={`${styles.hbtn} ${styles.hbtnGhost} ${styles.heroBtnWatch}`} onClick={openVideo}>
              &#x25B6;&nbsp; Video
            </button>
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
            <span className={styles.modesEyebrow} data-reveal>02 — Game Modes</span>
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
            <span className={styles.momentsEyebrow}>03 — Moments</span>
            <h2 className={styles.momentsTitle}>Moments in HyperGrid</h2>
          </div>

          <div className={styles.momentsBento}>

            {/* Step 1 */}
            <div className={styles.momentsStep} data-reveal data-reveal-delay="0.1">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true"></span>
                <span className={styles.momentsStepText}>Step 01</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
                <div className={styles.momentsCardVisual}>
                  <Image
                    src="/images/hyper-grid/hyper-grid-1.png"
                    alt="HyperGrid floor in action"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.momentsCardBody}>
                  <h3 className={styles.momentsCardH}>Camera positions on hypergrid</h3>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`${styles.momentsStep} ${styles.momentsStepOffset}`} data-reveal data-reveal-delay="0.2">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true"></span>
                <span className={styles.momentsStepText}>Step 02</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
                <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyFull}`}>
                  <h3 className={styles.momentsCardH}>After play scan QR code</h3>
                  <div className={styles.momentsAvatars}>
                    <span className={styles.momentsAvatar}>EL</span>
                    <span className={styles.momentsAvatar}>FC</span>
                    <span className={styles.momentsAvatar}>SS</span>
                    <span className={styles.momentsAvatar}>RL</span>
                  </div>
                  <div className={styles.momentsChecklist}>
                    <p className={styles.momentsChecklistTitle}>Player Journey</p>
                    {[
                      { label: 'Tap to pay & start game',          done: true },
                      { label: 'Select game mode on screen',       done: true },
                      { label: 'Auto-capture begins on grid entry', done: true },
                      { label: 'AI highlight clip ready to share', done: false },
                      { label: 'Score synced to leaderboard',      done: false },
                    ].map((item, i) => (
                      <div key={i} className={`${styles.momentsCheck} ${item.done ? styles.momentsCheckDone : ''}`}>
                        <span className={`${styles.momentsCheckIcon} ${item.done ? '' : styles.momentsCheckIconEmpty}`}>
                          {item.done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                <span className={styles.momentsStepDot} aria-hidden="true"></span>
                <span className={styles.momentsStepText}>Step 03</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardDark}`}>
                <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyCenter}`}>
                  <div className={styles.momentsIconCircle} aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 8v10M10 14.5l4 4.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <p className={styles.momentsCardEyebrow}>Shareable instantly</p>
                  <h3 className={styles.momentsCardH}>Moments gets downloaded locally</h3>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`${styles.momentsStep} ${styles.momentsStepOffset}`} data-reveal data-reveal-delay="0.4">
              <div className={styles.momentsStepLabel}>
                <span className={styles.momentsStepDot} aria-hidden="true"></span>
                <span className={styles.momentsStepText}>Step 04</span>
              </div>
              <div className={`${styles.momentsCard} ${styles.momentsCardAccent}`}>
                <div className={styles.momentsCardMedia}>
                  <Image
                    src="/images/hyper-grid/hyper-grid-2.png"
                    alt="HyperGrid gameplay"
                    width={400}
                    height={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, mixBlendMode: 'luminosity' }}
                  />
                </div>
                <div className={styles.momentsCardBody}>
                  <h3 className={styles.momentsCardH}>Sharable game highlights</h3>
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

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.processSection}>

        {/* ── Dark header strip — no background image ── */}
        <div className={styles.processHeaderWrap}>
          <div className={styles.processHeaderInner}>
            <span className={styles.processEyebrow} data-reveal>04 — How It Works</span>
            <h2 className={styles.processTitle} data-reveal data-reveal-delay="0.1">
              Easy, Automated &amp; Operator-Free
            </h2>
            <p className={styles.processSub} data-reveal data-reveal-delay="0.15">
              Crowd-Pulling Profit Machine
            </p>
            <button
              className={`${styles.processPlayBtn}${processPlaying ? ' ' + styles.processPlayBtnPlaying : ''}`}
              onClick={handleProcessPlay}
              disabled={processPlaying}
              data-reveal
              data-reveal-delay="0.2"
            >
              {processPlaying ? 'Playing…' : processAnimStep === 4 ? 'Play Again' : 'Click to Play'}
              {!processPlaying && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <polygon points="2,1 11,6 2,11" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Canvas — full-bleed BG + 4 floating boxes ── */}
        <div className={styles.processCanvas}>
          <Image
            src="/images/hyper-grid/hyper-grid-6.png"
            alt="HyperGrid automated floor gaming system in action"
            fill
            className={styles.processBg}
            sizes="100vw"
          />
          <div className={styles.processVignette} aria-hidden="true" />
          <div className={styles.processInner}>

          {/* Step 1 — TOP LEFT — right arrow → glide right */}
          <div className={`${styles.processUnit} ${styles.unitTopLeft} ${processAnimStep === 1 ? styles.animGlideRight : ''}`}>
            <div className={styles.processBox}>
              <span className={styles.boxStep}>Step 01</span>
              <h3 className={styles.boxTitle}>Tap the Card</h3>
              <p className={styles.boxDesc}>Comes integrated with your card reader / coin slot machine.</p>
            </div>
            <div className={styles.arrowRight} aria-hidden="true">
              <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
                <polyline points="2,2 11,11 2,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 23,11 14,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 4 — TOP RIGHT — left arrow ← glide left */}
          <div className={`${styles.processUnit} ${styles.unitTopRight} ${processAnimStep === 2 ? styles.animGlideLeft : ''}`}>
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

          {/* Step 2 — BOTTOM LEFT — up arrow ↑ glide up */}
          <div className={`${styles.processUnit} ${styles.unitBottomLeft} ${processAnimStep === 0 ? styles.animGlideUp : ''}`}>
            <div className={styles.processBox}>
              <span className={styles.boxStep}>Step 02</span>
              <h3 className={styles.boxTitle}>Select the Game</h3>
              <p className={styles.boxDesc}>Use our touch operated software to select your game.</p>
            </div>
            <div className={styles.arrowUp} aria-hidden="true">
              <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
                <polyline points="2,28 11,19 20,28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="2,16 11,7 20,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 3 — BOTTOM RIGHT — left arrow ← glide left */}
          <div className={`${styles.processUnit} ${styles.unitBottomRight} ${processAnimStep === 3 ? styles.animGlideLeft : ''}`}>
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
          </div>{/* /unitBottomRight */}
          </div>{/* /processInner */}
        </div>{/* /processCanvas */}
      </section>

      {/* ── ROI CALCULATOR ── */}
      <section id="roi-calculator" className={styles.calcSection}>
        <div className={styles.calcWrap}>

          <div className={styles.calcHeader}>
            <span className={styles.calcEyebrow} data-reveal>05 — ROI Calculator</span>
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
                  <span className={styles.calcChartNote}>Break-even when the line crosses zero</span>
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

      {/* ── TESTIMONIALS ── */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ── GET IN TOUCH ── */}
      <ContactForm defaultProduct="hypergrid" />
    </main>
  );
}
