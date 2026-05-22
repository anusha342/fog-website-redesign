'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import styles from './page.module.css';

/* ── SCROLL REVEAL ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Check if there is a specific delay set
            const delay = (e.target as HTMLElement).dataset.revealDelay || '0';
            (e.target as HTMLElement).style.transitionDelay = `${delay}s`;
            // Note: The CSS expects 'revealed' not 'is-revealed' for laser-tag or we might need to adjust it to match.
            // Actually the CSS migrated uses `[data-reveal].revealed { ... }` or `[data-reveal].is-revealed { ... }`
            // Looking at the original laser-tag.js: `entry.target.classList.add('revealed');`
            // Looking at original laser-tag.css: Oh wait, it wasn't in laser-tag.css, it was probably in style.css or globals.css
            // Our globals.css has `[data-reveal].is-revealed`
            e.target.classList.add('is-revealed');
            e.target.classList.add('revealed'); // Just in case
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

const MODES = [
  {
    name: 'Team Deathmatch',
    img: '/images/laser-tag/modes/team-death-match.png',
  },
  {
    name: 'Solo Deathmatch',
    img: '/images/laser-tag/modes/solo-death-match.png',
  },
  {
    name: 'Save the President',
    img: '/images/laser-tag/modes/save-the-president.png',
  }
];

const STEPS = [
  { name: 'Suit Up', desc: 'Players gear up with combat vests and laser guns. Ready to battle in under 2 minutes.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Select Game Mode', desc: 'Choose from Team Deathmatch, Solo Deathmatch, or Save the President at the kiosk.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Enter & Battle', desc: 'Players enter the arena and battle begins. Moments AI captures every highlight automatically.', img: '/images/laser-tag/laser-tag-1.png' },
  { name: 'Share & Return', desc: 'Review your score, claim your highlight clip, and challenge your squad to a rematch.', img: '/images/laser-tag/laser-tag-1.png' }
];

export default function LaserTagClient() {
  useScrollReveal();

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsVideoOpen(true);
    // document.body.style.overflow = 'hidden';
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      videoRef.current.muted = false;
    }
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    // document.body.style.overflow = '';
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  };

  // Game Modes State
  const [activeMode, setActiveMode] = useState(0);

  // Process Steps State
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className={styles.lasertagPage}>
      
      <header className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/videos/hypergrid-bg/idle.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} aria-hidden="true"></div>

        <div className={`${styles.hudCorner} ${styles.hudCornerTl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerTr}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerBl}`} aria-hidden="true"></div>
        <div className={`${styles.hudCorner} ${styles.hudCornerBr}`} aria-hidden="true"></div>

        <div className={styles.reticle} aria-hidden="true">
          <div className={styles.reticleRing}></div>
          <div className={`${styles.reticleCross} ${styles.reticleCrossH}`}></div>
          <div className={`${styles.reticleCross} ${styles.reticleCrossV}`}></div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} data-reveal data-reveal-delay="0.1">Laser Tag</h1>
          <div className={styles.heroBtns} data-reveal data-reveal-delay="0.2">
            <Link href="#what-is-lasertag" className={`${styles.hbtn} ${styles.hbtnSolid}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById('what-is-lasertag')?.scrollIntoView({ behavior: 'smooth' });
            }}>Explore &#x2192;</Link>
            <button className={`${styles.hbtn} ${styles.hbtnGhost} ${styles.heroBtnWatch}`} onClick={openVideo}>&#x25B6;&nbsp; Video</button>
          </div>
        </div>

        <div className={styles.heroQr} aria-hidden="true">
          <div className={styles.qrBox}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="8" y="8" width="8" height="8" fill="white"/>
              <rect x="28" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="32" y="8" width="8" height="8" fill="white"/>
              <rect x="4" y="28" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5"/>
              <rect x="8" y="32" width="8" height="8" fill="white"/>
              <rect x="28" y="28" width="4" height="4" fill="white"/>
              <rect x="36" y="28" width="4" height="4" fill="white"/>
              <rect x="28" y="36" width="4" height="4" fill="white"/>
              <rect x="36" y="36" width="4" height="4" fill="white"/>
              <rect x="32" y="32" width="4" height="4" fill="white"/>
            </svg>
          </div>
          <span className={styles.qrLabel}>Scan Me</span>
        </div>
      </header>

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

      <section id="what-is-lasertag" className={styles.whatSection}>
        <div className={styles.whatInner}>
          <div className={styles.whatEquipment} data-reveal>
            <div className={styles.whatEquipItem}>
              <Image
                src="/images/laser-tag/gun.png"
                alt="Laser Tag gun"
                className={styles.whatEquipImg}
                width={800}
                height={560}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className={styles.whatEquipItem}>
              <Image
                src="/images/laser-tag/vest.png"
                alt="Laser Tag vest"
                className={styles.whatEquipImg}
                width={800}
                height={560}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className={styles.whatCards} data-reveal>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Realistic Combat-Grade Laser Guns</p>
            </div>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Futuristic Sensor Vests with Haptic Feedback</p>
            </div>
            <div className={styles.whatCard}>
              <p className={styles.whatCardText}>Smart Arena Control &amp; Live Scoring System</p>
            </div>
          </div>
        </div>
      </section>

      <section id="game-modes" className={styles.modesSection}>
        <div className={styles.modesWrap}>
          <h2 className={styles.modesTitle} data-reveal>Game Modes</h2>
          
          <div className={styles.modesLeft}>
            <div className={styles.modesImgWrap}>
              <Image
                src={MODES[activeMode].img}
                alt={MODES[activeMode].name}
                className={styles.modesImg}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <button className={styles.modesVideoBtn} onClick={openVideo}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 4.8l4 2.2-4 2.2V4.8z" fill="currentColor"/></svg>
              Watch Gameplay
            </button>
          </div>

          <div className={styles.modesRight}>
            <div className={styles.modesLine}></div>
            {MODES.map((m, idx) => (
              <div key={idx}>
                <div 
                  className={`${styles.modeItem} ${activeMode === idx ? styles.modeItemActive : ''}`}
                  onMouseEnter={() => setActiveMode(idx)}
                >
                  <h3 className={styles.modeItemName}>{m.name}</h3>
                  <span className={styles.modeItemNum}>
                    {`{ 0${idx + 1} }`}
                    {idx === 2 && <span className={styles.modeNew}>New</span>}
                  </span>
                </div>
                <div className={styles.modesLine}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lt-moments" className={styles.momentsSection}>
        <div className={styles.momentsInner}>
          <div className={styles.momentsTop} data-reveal>
            <h2 className={styles.momentsTitle}>Moments in Laser Tag</h2>
          </div>
          <div className={styles.momentsBento} data-reveal data-reveal-delay="0.1">
            
            <div className={`${styles.momentsCard} ${styles.momentsCardLight}`}>
              <div className={styles.momentsCardVisual}>
                <Image src="/images/laser-tag/laser-tag-1.png" alt="Laser Tag arena" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className={styles.momentsCardBody}>
                <h3 className={styles.momentsCardH}>Play in arena</h3>
              </div>
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
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>Book session &amp; gear up</span>
                  </div>
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>Select game mode at kiosk</span>
                  </div>
                  <div className={`${styles.momentsCheck} ${styles.momentsCheckDone}`}>
                    <span className={styles.momentsCheckIcon}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <span>AI capture starts on entry</span>
                  </div>
                  <div className={styles.momentsCheck}>
                    <span className={`${styles.momentsCheckIcon} ${styles.momentsCheckIconEmpty}`}></span>
                    <span>Highlight clip delivered instantly</span>
                  </div>
                  <div className={styles.momentsCheck}>
                    <span className={`${styles.momentsCheckIcon} ${styles.momentsCheckIconEmpty}`}></span>
                    <span>Leaderboard rank updated</span>
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
                <h3 className={styles.momentsCardH}>Video gets automatically downloaded</h3>
              </div>
            </div>

            <div className={`${styles.momentsCard} ${styles.momentsCardAccent}`}>
              <div className={styles.momentsCardMedia}>
                <Image src="/images/laser-tag/laser-tag-1.png" alt="Moments AI" width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      </section>

      <section id="how-it-works" className={styles.processSection}>
        <div className={styles.processInner}>
          <div className={styles.processHeader} data-reveal>
            <h2 className={styles.processTitle}>Fast Setup, Full Immersion</h2>
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

      <section id="arena-design" className={styles.speModelSection}>
        <div className={styles.speModelInner}>
          <h2 className={styles.speModelTitle} data-reveal>Immersive Arena Design</h2>
          <p className={styles.speModelBody} data-reveal data-reveal-delay="0.1">
            Recommended area: <strong>700–3000 sq ft</strong> (approx. <strong>100 sq ft</strong> per player)<br/>
            Specialized in Designing Strategic 3D Laser Tag Arenas
          </p>
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

      <section className={styles.speDataSection}>
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
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2L4 10h6l-2 6 8-10h-6l2-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className={styles.speInfoTitle}>Game Modes</span>
              </div>
              <p className={styles.speInfoText}>Team Deathmatch, Solo Deathmatch, Save the President — with more modes regularly added.</p>
            </div>
            <div className={styles.speInfoCard}>
              <div className={styles.speInfoHeader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                <span className={styles.speInfoTitle}>Equipment</span>
              </div>
              <p className={styles.speInfoText}>Realistic laser guns + <strong>8-zone haptic vests</strong> with sub-10ms hit response time.</p>
            </div>
          </div>

        </div>
      </section>

      <section id="get-in-touch" className={styles.getInTouchSection}>
        <ContactForm />
      </section>

    </main>
  );
}
