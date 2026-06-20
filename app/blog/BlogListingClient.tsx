'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
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
      .catch(() => { });
    return () => {
      cancelAnimationFrame(animId);
      (window as any).__fogLenis?.destroy?.();
    };
  }, []);
}

function useScrollReveal(dependency: any) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-revealed)');
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
  }, [dependency]);
}

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  author?: string;
  coverImage?: string;
  category?: string;
  readTime?: number;
}

interface Props {
  posts: Post[];
  recentPosts: Post[];
  allCategories: string[];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BlogListingClient({ posts, recentPosts, allCategories }: Props) {
  useLenis();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const recentScrollRef = useRef<HTMLDivElement>(null);
  const allArticlesScrollRef = useRef<HTMLDivElement>(null);
  const articleListRef = useRef<HTMLDivElement>(null);
  const hoverScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const el = articleListRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (!atTop && !atBottom) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleListMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = articleListRef.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const y = e.clientY - top;
    const zone = height * 0.22;
    let speed = 0;
    if (y < zone) speed = -((zone - y) / zone) * 7;
    else if (y > height - zone) speed = ((y - (height - zone)) / zone) * 7;
    if (hoverScrollRef.current) cancelAnimationFrame(hoverScrollRef.current);
    if (speed !== 0) {
      const tick = () => {
        el.scrollBy({ top: speed });
        hoverScrollRef.current = requestAnimationFrame(tick);
      };
      hoverScrollRef.current = requestAnimationFrame(tick);
    }
  };

  const handleListMouseLeave = () => {
    if (hoverScrollRef.current) {
      cancelAnimationFrame(hoverScrollRef.current);
      hoverScrollRef.current = null;
    }
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [query, activeTag]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.85;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollVertical = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      const amount = ref.current.clientHeight * 0.75;
      ref.current.scrollBy({ top: direction === 'up' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tag = activeTag.toLowerCase();

    return posts.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q);

      const matchesTag = !tag || (p.category ?? '').toLowerCase() === tag;

      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  useScrollReveal(filtered);

  return (
    <div className={styles.blogWrapper}>

      {/* ── SECTION 1: RECENT POSTS (HORIZONTAL SCROLL) ── */}
      {recentPosts.length > 0 && (
        <section className={styles.recentSection} data-reveal>
          <div className={styles.recentSectionHeader}>
            <div>
              <span className={styles.recentEyebrow}>LATEST INTEL</span>
              <h2 className={styles.recentSectionTitle}>RECENT INSIGHTS</h2>
            </div>
          </div>
          <div ref={recentScrollRef} className={styles.recentHorizontalScroll}>
            {recentPosts.slice(0, 3).map((post) => (
              <div key={post.slug} className={`${styles.blogCard} ${styles.recentCard}`}>
                <Link href={`/blog/${post.slug}`} className={styles.blogCardLink}>
                  <div className={styles.blogCardImgWrap}>
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 767px) 100vw, 350px"
                      />
                    ) : (
                      <div className={styles.blogCardImgFallback} />
                    )}
                    <div className={styles.cardScanline} aria-hidden="true" />
                  </div>
                  <div className={styles.blogCardBody}>
                    <div className={styles.blogCardMeta}>
                      {post.category && (
                        <span className={styles.blogCardCategory}>{post.category}</span>
                      )}
                      <span className={styles.blogCardDate}>{formatDate(post.date)}</span>
                      {post.readTime && (
                        <span className={styles.blogCardReadTime}>{post.readTime} min read</span>
                      )}
                    </div>
                    <h3 className={styles.blogCardTitle}>{post.title}</h3>
                    {post.excerpt && (
                      <p className={styles.blogCardExcerpt}>{post.excerpt}</p>
                    )}
                    <span className={styles.blogCardReadMore}>Read Post &rarr;</span>
                  </div>
                </Link>
                {/* HUD Targeting Brackets */}
                <div className={`${styles.cardBracket} ${styles.bracketTl}`} aria-hidden="true" />
                <div className={`${styles.cardBracket} ${styles.bracketTr}`} aria-hidden="true" />
                <div className={`${styles.cardBracket} ${styles.bracketBl}`} aria-hidden="true" />
                <div className={`${styles.cardBracket} ${styles.bracketBr}`} aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 2: ALL ARTICLES — editorial numbered list ── */}
      <section className={styles.allArticlesSection} data-reveal data-reveal-delay="0.1">
        <div className={styles.allArticlesHeader}>
          <div>
            <span className={styles.allArticlesEyebrow}>EXPLORE FEED</span>
            <h2 className={styles.allArticlesTitle}>ALL ARTICLES</h2>
          </div>
          <Link href="/contact" className={styles.allArticlesCta}>Get In Touch &rarr;</Link>
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchFormWrapper}>
            <div className={styles.searchForm} role="search">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveTag(''); }}
                placeholder="Search articles..."
                className={styles.searchInput}
                aria-label="Search blog posts"
              />
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </span>
            </div>
          </div>
          {allCategories.length > 0 && (
            <div className={styles.tagCloudHorizontal}>
              <button type="button" onClick={() => { setActiveTag(''); setQuery(''); }}
                className={`${styles.tagPillHorizontal}${activeTag === '' ? ` ${styles.tagPillActive}` : ''}`}>All</button>
              {allCategories.map((cat) => (
                <button key={cat} type="button"
                  onClick={() => { setActiveTag(activeTag.toLowerCase() === cat.toLowerCase() ? '' : cat); setQuery(''); }}
                  className={`${styles.tagPillHorizontal}${activeTag.toLowerCase() === cat.toLowerCase() ? ` ${styles.tagPillActive}` : ''}`}>{cat}</button>
              ))}
            </div>
          )}
        </div>

        {/* Numbered editorial list */}
        {filtered.length === 0 ? (
          <p className={styles.empty}>{query || activeTag ? `No posts match "${query || activeTag}".` : 'No posts yet — check back soon.'}</p>
        ) : (
          <div ref={articleListRef} className={styles.articleList} onMouseMove={handleListMouseMove} onMouseLeave={handleListMouseLeave}>
            {filtered.slice(0, visibleCount).map((post, idx) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.articleRow} data-reveal data-reveal-delay={(idx % 4) * 0.07}>
                {/* Left: number + category */}
                <div className={styles.articleRowLeft}>
                  <span className={styles.articleNum}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {post.category && (
                    <span className={styles.articleCat}>{post.category}</span>
                  )}
                </div>

                {/* Center: title + excerpt + meta */}
                <div className={styles.articleRowContent}>
                  <h3 className={styles.articleRowTitle}>{post.title}</h3>
                  {post.excerpt && <p className={styles.articleRowExcerpt}>{post.excerpt}</p>}
                  <div className={styles.articleRowMeta}>
                    <span>{formatDate(post.date)}</span>
                    {post.readTime && <span>{post.readTime} min read</span>}
                  </div>
                </div>

                {/* Right: image + arrow */}
                <div className={styles.articleRowRight}>
                  <div className={styles.articleRowImg}>
                    {post.coverImage
                      ? <Image src={post.coverImage} alt={post.title} fill sizes="220px" style={{ objectFit: 'cover' }} />
                      : <div className={styles.blogCardImgFallback} />}
                  </div>
                  <div className={styles.articleRowArrow} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length > visibleCount && (
          <div className={styles.showMoreWrapper}>
            <button type="button" onClick={() => setVisibleCount((prev) => prev + 6)} className={styles.showMoreBtn}>
              Show More Articles
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
