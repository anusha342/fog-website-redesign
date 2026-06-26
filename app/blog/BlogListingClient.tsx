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
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return iso;
  }
}

export default function BlogListingClient({ posts, allCategories }: Props) {
  useLenis();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisibleCount(9);
  }, [query, activeTag]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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

      {/* ── FILTER BAR ── */}
      <div className={styles.filterBar}>
        {/* Left: tabs */}
        <div className={styles.filterTabs}>
          {(['', 'Announcements', 'Updates'] as const).map((tab) => (
            <button
              key={tab || 'all'}
              type="button"
              onClick={() => { setActiveTag(tab); setQuery(''); setSearchOpen(false); }}
              className={`${styles.filterTab}${activeTag === tab && !query ? ` ${styles.filterTabActive}` : ''}`}
            >
              {tab || 'All'}
            </button>
          ))}
        </div>

        {/* Right: search */}
        <div className={styles.filterSearch}>
          {searchOpen && (
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveTag(''); }}
              placeholder="Search..."
              className={styles.filterSearchInput}
              aria-label="Search blog posts"
              onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); } }}
            />
          )}
          <button
            type="button"
            onClick={() => { setSearchOpen((o) => !o); if (searchOpen) setQuery(''); }}
            className={`${styles.filterSearchBtn}${searchOpen ? ` ${styles.filterSearchBtnActive}` : ''}`}
            aria-label="Toggle search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── ARTICLE LIST ── */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>
          {query || activeTag ? `No posts match "${query || activeTag}".` : 'No posts yet — check back soon.'}
        </p>
      ) : (
        <div className={styles.articleList}>
          {filtered.slice(0, visibleCount).map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={styles.articleRow}
              data-reveal
              data-reveal-delay={(idx % 4) * 0.06}
            >
              {/* Left: large rectangle image */}
              <div className={styles.articleRowImg}>
                {post.coverImage
                  ? <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 767px) 100vw, 55vw" style={{ objectFit: 'cover' }} />
                  : <div className={styles.blogCardImgFallback} />}
              </div>

              {/* Right: content */}
              <div className={styles.articleRowContent}>
                <div className={styles.articleRowBody}>
                  <div className={styles.articleRowHeader}>
                    <h3 className={styles.articleRowTitle}>{post.title}</h3>
                    {post.category && (
                      <span className={styles.articleCat}>{post.category}</span>
                    )}
                  </div>

                  {post.excerpt && (
                    <p className={styles.articleRowExcerpt}>{post.excerpt}</p>
                  )}
                </div>

                <div className={styles.articleRowMeta}>
                  <span>{formatDate(post.date)}</span>
                  {post.readTime && (
                    <>
                      <span className={styles.metaDot} aria-hidden="true">•</span>
                      <span>{post.readTime} MIN READ</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length > visibleCount && (
        <div className={styles.showMoreWrapper}>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className={styles.showMoreBtn}
          >
            Show More Articles
          </button>
        </div>
      )}

    </div>
  );
}
