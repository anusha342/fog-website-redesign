'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

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
      .catch(() => {});
    return () => { cancelAnimationFrame(animId); };
  }, []);
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: Heading[];
  slug: string;
}

export default function PostTocClient({ headings, slug }: Props) {
  useLenis();
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);
  const [activeSectionProgress, setActiveSectionProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Sidebar visibility scroll trigger (based on prose section entering viewport)
  useEffect(() => {
    const handleScrollVisibility = () => {
      const el = document.querySelector(`.${styles.prose}`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Show when the top of the prose section enters the screen (e.g. within 200px of the top)
      setIsVisible(rect.top <= 200);
    };
    window.addEventListener('scroll', handleScrollVisibility, { passive: true });
    handleScrollVisibility();
    return () => window.removeEventListener('scroll', handleScrollVisibility);
  }, []);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollY = window.scrollY;
      const clientHeight = window.innerHeight || doc.clientHeight;
      const scrollHeight = doc.scrollHeight;
      
      const total = scrollHeight - clientHeight;
      if (total <= 0) {
        setProgress(100);
        return;
      }
      
      // Snap to 100% when last section is active, or we are about to end the page (e.g. within 120px of the bottom)
      const lastHeadingId = headings.length > 0 ? headings[headings.length - 1].id : null;
      const isLastSectionActive = lastHeadingId && activeId === lastHeadingId;
      const isNearBottom = scrollY + clientHeight >= scrollHeight - 120;
      
      if (isLastSectionActive || isNearBottom) {
        setProgress(100);
      } else {
        setProgress(Math.min(100, Math.max(0, (scrollY / total) * 100)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeId, headings]);

  // Active section tracking
  useEffect(() => {
    if (headings.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0% -70% 0%', threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [headings]);

  // Active section percentage read calculation
  useEffect(() => {
    const handleScroll = () => {
      if (!activeId || headings.length === 0) {
        setActiveSectionProgress(0);
        return;
      }
      const el = document.getElementById(activeId);
      if (!el) {
        setActiveSectionProgress(0);
        return;
      }
      const rect = el.getBoundingClientRect();
      const activeIndex = headings.findIndex((h) => h.id === activeId);
      
      let nextEl: HTMLElement | null = null;
      if (activeIndex < headings.length - 1) {
        nextEl = document.getElementById(headings[activeIndex + 1].id);
      }
      
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = nextEl 
        ? nextEl.getBoundingClientRect().top + window.scrollY 
        : document.documentElement.scrollHeight - 150; // slightly padded bottom border
      
      const sectionHeight = sectionBottom - sectionTop;
      if (sectionHeight <= 0) {
        setActiveSectionProgress(0);
        return;
      }
      
      const scrolled = window.scrollY - sectionTop + window.innerHeight * 0.15; // match intersection observer rootMargin top
      const pct = Math.max(0, Math.min(100, (scrolled / sectionHeight) * 100));
      setActiveSectionProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId, headings]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getHeadingStatus = (id: string, index: number) => {
    if (progress > 98) return 'completed';
    const activeIndex = headings.findIndex((h) => h.id === activeId);
    if (activeIndex === -1) {
      return index === 0 ? 'in-progress' : 'unread';
    }
    if (index < activeIndex) {
      return 'completed';
    } else if (index === activeIndex) {
      return 'in-progress';
    } else {
      return 'unread';
    }
  };

  const renderProgressIcon = (status: 'completed' | 'in-progress' | 'unread', progressPercent: number) => {
    if (status === 'completed') {
      return (
        <svg className={styles.tocIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="var(--accent, #F05023)" />
        </svg>
      );
    }
    if (status === 'in-progress') {
      const radius = 6;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
      return (
        <svg className={styles.tocIcon} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="2"
          />
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="none"
            stroke="var(--accent, #F05023)"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 8 8)"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
      );
    }
    return (
      <svg className={styles.tocIcon} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r={6}
          fill="none"
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <>
      {/* Top horizontal progress bar */}
      <div className={styles.topProgressBarContainer} aria-hidden="true">
        <div className={styles.topProgressBar} style={{ width: `${progress}%` }} />
      </div>

      <aside className={`${styles.tocPanel} ${isVisible ? styles.tocPanelVisible : ''}`} aria-label="Article navigation">

        {/* Reading progress sidebar indicator */}
        <div className={styles.progressBlock}>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ height: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.progressPercent}>{Math.round(progress)}%</span>
            <span className={styles.progressHint}>read</span>
          </div>
        </div>

        {/* Table of contents */}
        {headings.length > 0 && (
          <div className={styles.tocBlock}>
            <p className={styles.panelLabel}>Contents</p>
            <nav className={styles.tocNav} aria-label="Table of contents">
              {headings.map((h, idx) => {
                const status = getHeadingStatus(h.id, idx);
                return (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => handleTocClick(e, h.id)}
                    className={[
                      styles.tocLink,
                      h.level === 3 ? styles.tocLinkSub : '',
                      activeId === h.id ? styles.tocLinkActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className={styles.tocIconWrapper}>
                      {renderProgressIcon(status, activeSectionProgress)}
                    </span>
                    <span className={styles.tocText}>{h.text}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {/* Share */}
        <div className={styles.shareBlock}>
          <p className={styles.panelLabel}>Share</p>
          <div className={styles.shareRow}>
            <a
              href={`https://twitter.com/intent/tweet?url=https://futureofgaming.tech/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareBtn}
              aria-label="Share on X / Twitter"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.9-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=https://futureofgaming.tech/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareBtn}
              aria-label="Share on LinkedIn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://futureofgaming.tech/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shareBtn}
              aria-label="Share on Facebook"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        {/* CTA */}
        <Link href="/#get-in-touch" className={styles.tocCta}>
          Get In Touch
        </Link>

      </aside>
    </>
  );
}
