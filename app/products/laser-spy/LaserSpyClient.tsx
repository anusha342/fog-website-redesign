'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import ContactForm from '@/components/ContactForm';
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
            const delay = (e.target as HTMLElement).dataset.revealDelay || '0';
            (e.target as HTMLElement).style.transitionDelay = `${delay}s`;
            e.target.classList.add('is-revealed');
            e.target.classList.add('revealed');
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

const MODES = [
  {
    name: 'Solo Challenge',
    img: '/images/laser-spy/laser-spy-1.jpg',
  },
  {
    name: 'Team Relay',
    img: '/images/laser-spy/laser-spy-1.jpg',
  },
  {
    name: 'Elite Time Trial',
    img: '/images/laser-spy/laser-spy-1.jpg',
  }
];

const STEPS = [
  {
    name: 'Enter the Room',
    desc: 'Step into the darkened chamber. Laser beams crisscross every angle — your mission briefing begins.',
    img: '/images/laser-spy/laser-spy-1.jpg'
  },
  {
    name: 'Study the Grid',
    desc: 'Before the timer starts, take 10 seconds to map the beam layout. Every second of planning saves three in the run.',
    img: '/images/laser-spy/laser-spy-1.jpg'
  },
  {
    name: 'Navigate & Complete',
    desc: 'Move through the grid without breaking a beam. Each breach adds a penalty. Complete the course for your best time.',
    img: '/images/laser-spy/laser-spy-1.jpg'
  },
  {
    name: 'Claim Your Moments',
    desc: 'Scan the QR code at the exit. Your AI highlight clip — every near-miss and perfect move — is ready to share instantly.',
    img: '/images/laser-spy/laser-spy-1.jpg'
  }
];

interface Props {
  testimonials: Testimonial[];
}

export default function LaserSpyClient({ testimonials }: Props) {
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
      videoRef.current.play().catch(() => {});
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

  // Game Modes State
  const [activeMode, setActiveMode] = useState(0);

  // Process Steps State
  const [activeStep, setActiveStep] = useState(0);

  // ROI Calculator State
  const [floor, setFloor] = useState(300);
  const [footfall, setFootfall] = useState(500);
  const [hours, setHours] = useState(10);
  const [ticket, setTicket] = useState(200);
  const [conversion, setConversion] = useState(12);

  const productCost = floor * 3500;
  const dailyPlayers = footfall * (conversion / 100);
  const dailyRevenue = dailyPlayers * ticket;
  const monthlyRevenue = dailyRevenue * 30;
  const yearlyRevenue = monthlyRevenue * 12;
  const paybackMonths = monthlyRevenue > 0 ? Math.ceil(productCost / monthlyRevenue) : 0;
  const fiveYearProfit = (yearlyRevenue * 5) - productCost;
  const roi = productCost > 0 ? ((fiveYearProfit / productCost) * 100) : 0;

  // Testimonials Carousel State
  const [curTestimonial, setCurTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextTestimonial = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurTestimonial((prev) => (prev + 1) % testimonials.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, testimonials.length]);

  const prevTestimonial = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, testimonials.length]);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 6000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  const currentT = testimonials[curTestimonial] || testimonials[0];

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      updateCharts();
    }
  }, [floor, footfall, hours, ticket, conversion]);

  const updateCharts = () => {
    const Chart = (window as any).Chart;
    const lineCanvas = document.getElementById('chart-cumulative') as HTMLCanvasElement;
    const barCanvas = document.getElementById('chart-revenue') as HTMLCanvasElement;
    if (!lineCanvas || !barCanvas) return;

    if ((window as any).lineChartInstance) (window as any).lineChartInstance.destroy();
    if ((window as any).barChartInstance) (window as any).barChartInstance.destroy();

    (window as any).lineChartInstance = new Chart(lineCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: Array.from({ length: 60 }, (_, i) => ((i + 1) % 12 === 0 ? 'Y' + ((i + 1) / 12) : '')),
        datasets: [{
          data: Array.from({ length: 60 }, (_, i) => ((monthlyRevenue * (i + 1)) - productCost) / 100000),
          borderColor: '#F05023',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.6)', padding: 12,
            callbacks: {
              label: (ctx: any) => '₹' + ctx.parsed.y.toFixed(1) + 'L',
              title: (ctx: any) => 'Month ' + (ctx[0].dataIndex + 1)
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, border: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, border: { display: false } }
        }
      }
    });

    (window as any).barChartInstance = new Chart(barCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Product Cost', 'Monthly Rev.', 'Yearly Rev.', '5-Year Rev.'],
        datasets: [{
          data: [productCost / 100000, monthlyRevenue / 100000, yearlyRevenue / 100000, (yearlyRevenue * 5) / 100000],
          backgroundColor: ['rgba(240,80,35,0.35)', '#F05023', '#F05023', '#F05023'],
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.6)', padding: 12,
            callbacks: { label: (ctx: any) => '₹' + ctx.parsed.x.toFixed(1) + 'L' }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, border: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, border: { display: false } }
        }
      }
    });
  };

  return (
    <main className={styles.laserspyPage}>
      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" 
        strategy="lazyOnload" 
        onLoad={updateCharts}
      />

      {/* 1. HERO SECTION */}
      <header className={styles.hero} data-nav-theme="dark">
        <video className={styles.heroVideo} autoPlay muted loop playsInline poster="/images/laser-spy/laser-spy-1.jpg">
          <source src="/videos/hypergrid-bg-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>

        <div className={`${styles.hudCorner} ${styles.hudCornerTl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerTr}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerBl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerBr}`} aria-hidden="true"></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.1">Laser Spy</h1>
          <div className={styles.heroBtns} data-reveal data-reveal-delay="0.2">
            <button className={`${styles.hbtn} ${styles.hbtnSolid}`} onClick={() => {
              document.getElementById('what-is-laserspy')?.scrollIntoView({ behavior: 'smooth' });
            }}>Discover &#x2192;</button>
            <button className={`${styles.hbtn} ${styles.hbtnGhost} ${styles.heroBtnWatch}`} onClick={openVideo}>&#x25B6;&nbsp; Video</button>
          </div>
        </div>
      </header>

      {/* VIDEO MODAL */}
      <div className={`${styles.videoModal} ${isVideoOpen ? styles.open : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) closeVideo();
      }}>
        <div className={styles.videoContainer}>
          <button className={styles.videoClose} onClick={closeVideo}>&#x2715; Close</button>
          <video ref={videoRef} controls>
            <source src="/videos/clip1.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* 2. WHAT IS LASER SPY */}
      <section id="what-is-laserspy" className={styles.whatSection} data-nav-theme="light">
        <div className={styles.whatInner}>
          <div className={styles.whatImgWrap} data-reveal>
            <Image
              src="/images/laser-spy/laser-spy-1.jpg"
              alt="Laser Spy beam maze in action"
              className={styles.whatImg}
              width={1600}
              height={900}
              sizes="100vw"
            />
          </div>
          <div className={styles.whatCards} data-reveal>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Laser Beam Maze You Can&apos;t Break</p>
            </div>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Timed Challenges with Live Leaderboard</p>
            </div>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Moments AI Captures Every Near-Miss</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHALLENGE MODES */}
      <section id="challenge-modes" className={styles.modesV2Section} data-nav-theme="dark">
        <div className={styles.modesV2Wrap}>
          <h2 className={styles.modesV2Title} data-reveal>Challenge Modes</h2>

          <div className={styles.modesV2Left}>
            <div className={styles.modesV2ImgWrap}>
              <Image
                src={MODES[activeMode].img}
                alt={MODES[activeMode].name}
                className={styles.modesV2Img}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <button className={styles.modesVideoBtn} onClick={openVideo}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 4.8l4 2.2-4 2.2V4.8z" fill="currentColor"/></svg>
              Watch Gameplay
            </button>
          </div>

          <div className={styles.modesV2Right}>
            <div className={styles.modesV2Line}></div>
            {MODES.map((m, idx) => (
              <div key={idx}>
                <div 
                  className={`${styles.modeItem} ${activeMode === idx ? styles.modeItemActive : ''}`}
                  onMouseEnter={() => setActiveMode(idx)}
                >
                  <h3 className={styles.modeItemName}>{m.name}</h3>
                  <span className={styles.modeItemNum}>{`{ 0${idx + 1} }`}</span>
                </div>
                <div className={styles.modesV2Line}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3b. MOMENTS */}
      <section id="ls-moments" className={styles.momentsSection} data-nav-theme="light">
        <div className={styles.momentsInner}>
          <div className={styles.momentsTop} data-reveal>
            <h2 className={styles.momentsTitle}>Moments in Laser Spy</h2>
          </div>
          <div className={styles.momentsBento} data-reveal data-reveal-delay="0.1">
            
            <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
              <div className={styles.momentsCardVisual}>
                <Image src="/images/laser-spy/laser-spy-1.jpg" alt="Laser Spy beam maze" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.momentsCardBody}>
                <h3 className={styles.momentsCardH}>Camera positions in the maze</h3>
              </div>
            </div>

            <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
              <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyFull}`}>
                <h3 className={styles.momentsCardH}>After run scan QR code</h3>
                <div className={styles.momentsAvatars}>
                  <span className={styles.momentsAvatar}>SC</span>
                  <span className={styles.momentsAvatar}>TR</span>
                  <span className={styles.momentsAvatar}>ET</span>
                </div>
                <div className={styles.momentsChecklist}>
                  <p className={styles.momentsChecklistTitle}>Player Journey</p>
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>Enter the challenge room</span>
                  </div>
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>Select challenge mode at kiosk</span>
                  </div>
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>AI capture starts automatically</span>
                  </div>
                  <div className={styles.momentsCheck}>
                    <span className={`${styles.momentsCheckIcon} ${styles.momentsCheckIconEmpty}`}></span>
                    <span>Highlight clip ready to share</span>
                  </div>
                  <div className={styles.momentsCheck}>
                    <span className={`${styles.momentsCheckIcon} ${styles.momentsCheckIconEmpty}`}></span>
                    <span>Score synced to leaderboard</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.momentsCard} ${styles.momentsCardDark}`}>
              <div className={`${styles.momentsCardBody} ${styles.momentsCardBodyCenter}`}>
                <div className={styles.momentsIconCircle} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8v10M10 14.5l4 4.5 4-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.5"/></svg>
                </div>
                <p className={styles.momentsCardEyebrow}>Shareable instantly</p>
                <h3 className={styles.momentsCardH}>Moments gets downloaded locally</h3>
              </div>
            </div>

            <div className={`${styles.momentsCard} ${styles.momentsCardAccent}`}>
              <div className={styles.momentsCardMedia}>
                <Image src="/images/laser-spy/laser-spy-1.jpg" alt="Laser Spy Moments AI" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.momentsCardBody}>
                <h3 className={styles.momentsCardH}>Sharable spy highlights</h3>
                <span className={styles.momentsBadge}>Real-Time Highlights</span>
              </div>
              <div className={styles.momentsMadeIn}>
                <span>By FOG Technologies</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className={styles.processSection} data-nav-theme="dark">
        <div className={styles.processInner}>
          <div className={styles.processHeader} data-reveal>
            <h2 className={styles.processTitle}>Stealth. Precision. Escape.</h2>
          </div>
          <div className={styles.processStage}>
            {STEPS.map((s, idx) => (
              <div 
                key={idx} 
                className={`${styles.processSlide} ${activeStep === idx ? styles.processSlideActive : ''}`} 
                style={{ backgroundImage: `url('${s.img}')` }}
              ></div>
            ))}
            <div className={styles.processOverlay}>
              <h3 className={styles.processStepName}>{STEPS[activeStep].name}</h3>
              <p className={styles.processStepDesc}>{STEPS[activeStep].desc}</p>
            </div>
          </div>
          <div className={styles.processNav}>
            {STEPS.map((s, idx) => (
              <button 
                key={idx} 
                className={`${styles.processBtn} ${activeStep === idx ? styles.processBtnActive : ''}`} 
                onClick={() => setActiveStep(idx)}
              >
                <div className={styles.processBtnBody}>
                  <span className={styles.processBtnNum}>0{idx + 1}</span>
                  <span className={styles.processBtnName}>{s.name}</span>
                  <span className={styles.processBtnDesc}>{s.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROI CALCULATOR */}
      <section id="roi-calculator" className={styles.calcSection} data-nav-theme="dark">
        <div className={styles.calcInner}>
          <div className={styles.calcHeader}>
            <h2 className={styles.sectionTitle} data-reveal>ROI Calculator</h2>
          </div>
          <div className={styles.calcGrid}>
            
            <div className={styles.calcInputs}>
              <h3 className={styles.calcPanelTitle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 8h8M4 5h8M4 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Input Parameters
              </h3>
              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Room Area (sq ft)</label>
                  <span className={styles.calcVal}>{floor}</span>
                </div>
                <input type="range" className={styles.calcRange} min="100" max="1200" value={floor} step="50" onChange={(e) => setFloor(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>100 sq ft</span><span>1200 sq ft</span></div>
              </div>
              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Daily Footfall</label>
                  <span className={styles.calcVal}>{footfall}</span>
                </div>
                <input type="range" className={styles.calcRange} min="100" max="2000" value={footfall} step="50" onChange={(e) => setFootfall(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>100</span><span>2000</span></div>
              </div>
              <div className={styles.calcField}>
                <label className={styles.calcSelectLabel}>Operating Hours</label>
                <select className={styles.calcSelect} value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                  <option value="8">8 hours/day</option>
                  <option value="10">10 hours/day</option>
                  <option value="12">12 hours/day</option>
                  <option value="16">16 hours/day</option>
                </select>
              </div>
              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Ticket Price (₹)</label>
                  <span className={styles.calcVal}>₹{ticket}</span>
                </div>
                <input type="range" className={styles.calcRange} min="50" max="600" value={ticket} step="10" onChange={(e) => setTicket(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>₹50</span><span>₹600</span></div>
              </div>
              <div className={styles.calcField}>
                <div className={styles.calcFieldRow}>
                  <label>Conversion Rate (%)</label>
                  <span className={styles.calcVal}>{conversion}%</span>
                </div>
                <input type="range" className={styles.calcRange} min="5" max="30" value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
                <div className={styles.calcRangeLabels}><span>5%</span><span>30%</span></div>
              </div>
            </div>

            <div className={styles.calcResults}>
              <div className={styles.calcMetrics}>
                <div className={styles.calcMetric}>
                  <span className={styles.calcMetricLabel}>Investment</span>
                  <span className={styles.calcMetricVal}>₹{(productCost / 100000).toFixed(1)}L</span>
                </div>
                <div className={`${styles.calcMetric} ${styles.calcMetricAccent}`}>
                  <span className={styles.calcMetricLabel}>Monthly Revenue</span>
                  <span className={styles.calcMetricVal}>₹{(monthlyRevenue / 100000).toFixed(1)}L</span>
                </div>
                <div className={`${styles.calcMetric} ${styles.calcMetricAccent}`}>
                  <span className={styles.calcMetricLabel}>Payback Period</span>
                  <span className={styles.calcMetricVal}>{paybackMonths} mo</span>
                </div>
                <div className={`${styles.calcMetric} ${styles.calcMetricGreen}`}>
                  <span className={styles.calcMetricLabel}>5-Year ROI</span>
                  <span className={styles.calcMetricVal}>{roi.toFixed(0)}%</span>
                </div>
              </div>

              <div className={styles.calcChartCard}>
                <h4 className={styles.calcChartTitle}>60-Month Cumulative Profit (₹ Lakhs)</h4>
                <div className={styles.calcChartWrap}>
                  <canvas id="chart-cumulative"></canvas>
                </div>
                <p className={styles.calcChartNote}>Break-even occurs when the line crosses zero.</p>
              </div>

              <div className={styles.calcChartCard}>
                <h4 className={styles.calcChartTitle}>Revenue Projection (₹ Lakhs)</h4>
                <div className={`${styles.calcChartWrap} ${styles.calcChartWrapBar}`}>
                  <canvas id="chart-revenue"></canvas>
                </div>
              </div>

              <div className={styles.calcDailyCard}>
                <h4 className={styles.calcChartTitle}>Daily Breakdown</h4>
                <div className={styles.calcDailyGrid}>
                  <div className={styles.calcDailyItem}>
                    <span className={styles.calcDailyLabel}>Expected Players</span>
                    <span className={styles.calcDailyVal}>{Math.round(dailyPlayers)}</span>
                    <span className={styles.calcDailyUnit}>per day</span>
                  </div>
                  <div className={styles.calcDailyItem}>
                    <span className={styles.calcDailyLabel}>Daily Revenue</span>
                    <span className={`${styles.calcDailyVal} ${styles.calcDailyValAccent}`}>₹{Math.round(dailyRevenue).toLocaleString('en-IN')}</span>
                    <span className={styles.calcDailyUnit}>per day</span>
                  </div>
                  <div className={styles.calcDailyItem}>
                    <span className={styles.calcDailyLabel}>Sessions per Hour</span>
                    <span className={styles.calcDailyVal}>{Math.round(dailyPlayers / hours)}</span>
                    <span className={styles.calcDailyUnit}>avg capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.calcFooter}>
            <p className={styles.calcDisclaimer}>These estimates are indicative and based on industry averages. Actual results may vary based on location, marketing, and operational factors.</p>
            <Link href="/contact" className={`${styles.hbtn} ${styles.hbtnSolid}`}>Get a Detailed Proposal &nbsp;&#x2192;</Link>
          </div>
        </div>
      </section>

      {/* 6. ROOM DESIGN */}
      <section id="specs-design" className={styles.speModelSection} data-nav-theme="dark">
        <div className={styles.speModelInner}>
          <h2 className={styles.speModelTitle} data-reveal>Room Design</h2>
          <p className={styles.speModelBody} data-reveal data-reveal-delay="0.1">
            Recommended area: <strong>200–1,200 sq ft</strong> (approx. <strong>50 sq ft</strong> per player)<br/>
            Specialized in Designing Strategic Laser Beam Maze Rooms
          </p>
          <div className={styles.speModelImgWrap} data-reveal data-reveal-delay="0.15">
            <Image
              src="/images/laser-spy/laser-spy-1.jpg"
              alt="Laser Spy Room Design"
              className={styles.speModelImg}
              width={900}
              height={500}
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
        </div>
      </section>

      {/* 6b. SPECS SECTION */}
      <section className={styles.speDataSection} data-nav-theme="dark">
        <div className={styles.speDataInner}>
          
          <div className={styles.speDimsCard} data-reveal>
            <h3 className={styles.speAreaTitle}>
              <span className={styles.speAreaLabel}>Area</span>
              <span className={styles.speAreaNum}>200–1,200</span> sqft
            </h3>
            <div className={styles.speDimsTable}>
              <div className={styles.speDimsRow}><span>Players</span><span>1–4</span><span>per session</span></div>
              <div className={styles.speDimsRow}><span>Session</span><span>3–8 min</span><span>operator set</span></div>
              <div className={styles.speDimsRow}><span>Laser Beams</span><span>20–120</span><span>individually addressable</span></div>
              <div className={styles.speDimsRow}><span>Difficulty</span><span>5 levels</span><span>+ fully custom</span></div>
            </div>
          </div>

          <div className={styles.speInfoCards} data-reveal data-reveal-delay="0.1">
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2L4 10h6l-2 6 8-10h-6l2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className={styles.speInfoTitle}>Challenge Modes</span>
              </div>
              <p className={styles.speInfoText}>Solo Challenge, Team Relay, and Elite Time Trial — with more modes added regularly.</p>
            </div>
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                <span className={styles.speInfoTitle}>Alarm System</span>
              </div>
              <p className={styles.speInfoText}>Instant audio alarm + red flash on beam break. Timer precision of <strong>±10 ms</strong> for fair leaderboard ranking.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section id="testimonials" className={styles.testSection} data-nav-theme="light">
          <div className={styles.testInner}>
            <button className={`${styles.testArrowAbs} ${styles.testArrowPrev}`} onClick={prevTestimonial} aria-label="Previous testimonial">
              <svg viewBox="0 0 18 18" aria-hidden="true"><polyline points="11,4 6,9 11,14"/></svg>
            </button>
            <button className={`${styles.testArrowAbs} ${styles.testArrowNext}`} onClick={nextTestimonial} aria-label="Next testimonial">
              <svg viewBox="0 0 18 18" aria-hidden="true"><polyline points="7,4 12,9 7,14"/></svg>
            </button>
            
            <div className={`${styles.testGrid} ${isTransitioning ? styles.testFade : ''}`}>
              <div className={styles.testImage}>
                <Image
                  src={currentT.avatar || '/images/operators/person-1.jpg'}
                  alt={currentT.name}
                  className={styles.testPersonImg}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.testRight}>
                <div className={styles.testQuoteMark} aria-hidden="true" data-reveal>"</div>
                <div className={styles.testimonialContent}>
                  <blockquote className={styles.testQuote}>{currentT.body}</blockquote>
                  <p className={styles.testSub}>{currentT.location}</p>
                  <div className={styles.testDivider} aria-hidden="true"></div>
                  <p className={styles.testName}>{currentT.name}</p>
                  <div className={styles.testMetaWrap}>
                    {currentT.logo && (
                      <Image 
                        src={currentT.logo} 
                        alt={currentT.company} 
                        className={styles.testZoneLogo}
                        width={100}
                        height={100}
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <span className={styles.testRole}>{currentT.designation}, {currentT.company}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. GET IN TOUCH FORM */}
      <section id="get-in-touch" className={styles.getInTouchSection} data-nav-theme="surface">
        <ContactForm />
      </section>

    </main>
  );
}
