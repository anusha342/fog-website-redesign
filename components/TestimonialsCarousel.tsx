'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Testimonial } from '@/lib/testimonials';
import styles from './testimonials-carousel.module.css';

type Phase = 'visible' | 'exiting' | 'entering';

function getVenueLogo(company: string, logoUrl?: string) {
  if (!company) return logoUrl;
  const name = company.toLowerCase();
  if (name.includes('masti')) return '/images/gamezones_logo/mastizone-logo.png';
  if (name.includes('timezone')) return '/images/gamezones_logo/timezone-logo.png';
  if (name.includes('skyjumper') || name.includes('sky jumper')) return '/images/gamezones_logo/skyjumper-logo.png';
  if (name.includes('xplore')) return '/images/gamezones_logo/xplore-logo.png';
  if (name.includes('rebounce')) return '/images/gamezones_logo/rebounce-logo.png';
  if (name.includes('hopup') || name.includes('hop up')) return '/images/gamezones_logo/hopup-logo.png';
  return logoUrl;
}

function getAvatar(avatarUrl?: string, index?: number) {
  if (!avatarUrl || avatarUrl.includes('placeholder') || avatarUrl.startsWith('https://')) {
    const avatars = [
      '/images/operators/person-1.jpg',
      '/images/operators/person-2.png',
      '/images/operators/person-3.png'
    ];
    return avatars[(index || 0) % avatars.length];
  }
  return avatarUrl;
}

interface Props {
  testimonials: Testimonial[];
  heading?: string;
}

export default function TestimonialsCarousel({
  testimonials,
  heading = 'What operators say',
}: Props) {
  const [tIdx, setTIdx] = useState(0);
  const [tPhase, setTPhase] = useState<Phase>('visible');
  const tBusy = useRef(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tIdxForAuto = useRef(0);

  const showTestimonial = useCallback((nextIdx: number) => {
    if (tBusy.current) return;
    tBusy.current = true;
    tIdxForAuto.current = nextIdx;
    setTPhase('exiting');
    setTimeout(() => {
      setTIdx(nextIdx);
      setTPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTPhase('visible');
          setTimeout(() => { tBusy.current = false; }, 280);
        });
      });
    }, 220);
  }, []);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (!testimonials.length) return;
    autoRef.current = setInterval(() => {
      const next = (tIdxForAuto.current + 1) % testimonials.length;
      showTestimonial(next);
    }, 4000);
  }, [showTestimonial, testimonials.length]);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  if (!testimonials.length) return null;
  const t = testimonials[tIdx];

  const phaseClass =
    tPhase === 'exiting' ? styles.exiting :
      tPhase === 'entering' ? styles.entering :
        styles.visible;

  return (
    <section
      id="testimonials"
      className={styles.testimonials}
      aria-labelledby="tc-heading"
      data-nav-theme="light"
    >
      <div className={styles.testInner}>
        <h2 id="tc-heading" className={styles.testHeading}>{heading}</h2>

        <div
          className={styles.testControls}
          onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
          onMouseLeave={startAuto}
        >
          <button
            className={styles.testArrowAbs}
            aria-label="Previous testimonial"
            onClick={() => {
              const next = (tIdx - 1 + testimonials.length) % testimonials.length;
              showTestimonial(next);
              startAuto();
            }}
          >
            <svg viewBox="0 0 18 18" aria-hidden="true"><polyline points="11,4 6,9 11,14" /></svg>
          </button>

          <div className={styles.testGrid}>
            <div className={styles.testImage}>
              <Image
                src={getAvatar(t.avatar, tIdx)}
                alt={t.name}
                width={300}
                height={400}
                className={styles.testPersonImg}
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
            <div className={styles.testRight}>
              <div className={styles.testQuoteMark} aria-hidden="true">&ldquo;</div>
              <div className={`${styles.testimonialContent} ${phaseClass}`}>
                <blockquote className={styles.testQuote}>{t.body}</blockquote>
                <div className={styles.testDivider} aria-hidden="true" />
                <div className={styles.testAuthorRow}>
                  <div className={styles.testAuthorInfo}>
                    <p className={styles.testName}>{t.name}</p>
                    <span className={styles.testRole}>
                      {[t.designation, t.company].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  {getVenueLogo(t.company, t.logo) && (
                    <div className={styles.testLogoWrap}>
                      <Image
                        src={getVenueLogo(t.company, t.logo)!}
                        alt={`${t.company} logo`}
                        width={120}
                        height={48}
                        className={styles.testZoneLogo}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            className={styles.testArrowAbs}
            aria-label="Next testimonial"
            onClick={() => {
              const next = (tIdx + 1) % testimonials.length;
              showTestimonial(next);
              startAuto();
            }}
          >
            <svg viewBox="0 0 18 18" aria-hidden="true"><polyline points="7,4 12,9 7,14" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
