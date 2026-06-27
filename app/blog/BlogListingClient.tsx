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

function BlogCard({ post, idx }: { post: Post; idx: number }) {
  return (
    <div
      className={styles.articleCard}
      data-reveal
      data-reveal-delay={String((idx % 2) * 0.12)}
    >
      <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={styles.cardImgWrap}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 767px) 100vw, 35vw"
              priority={idx < 2}
            />
          ) : (
            <div className={styles.cardImgFallback} />
          )}
        </div>
        <div className={styles.cardBody}>
          {post.category && (
            <span className={styles.cardCategory}>{post.category}</span>
          )}
          <h3 className={styles.cardTitle}>{post.title}</h3>
          {post.excerpt && (
            <p className={styles.cardExcerpt}>{post.excerpt}</p>
          )}
          
          <div className={styles.cardFooter}>
            <div className={styles.authorBox}>
              <div className={styles.authorAvatar}>
                {post.author ? post.author.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>{post.author || 'FOG Team'}</span>
                <span className={styles.postDate}>
                  {formatDate(post.date)}
                  {post.readTime ? ` • ${post.readTime} MIN READ` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function BlogListingClient({ posts, recentPosts, allCategories }: Props) {
  useLenis();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fallback to slice first posts if recentPosts is empty
  const finalRecentPosts = useMemo(() => {
    if (recentPosts && recentPosts.length > 0) return recentPosts;
    return posts.slice(0, 3);
  }, [recentPosts, posts]);

  useEffect(() => {
    setVisibleCount(6);
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

  // Split into left and right columns for masonry layout
  const leftColPosts = useMemo(() => {
    return filtered.slice(0, visibleCount).filter((_, idx) => idx % 2 === 0);
  }, [filtered, visibleCount]);

  const rightColPosts = useMemo(() => {
    return filtered.slice(0, visibleCount).filter((_, idx) => idx % 2 === 1);
  }, [filtered, visibleCount]);

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

      {/* ── GRID + SIDEBAR LAYOUT ── */}
      <div className={styles.blogLayout}>
        {/* Left: Articles Column */}
        <div className={styles.articlesColumn}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>
              {query || activeTag ? `No posts match "${query || activeTag}".` : 'No posts yet — check back soon.'}
            </p>
          ) : (
            <>
              {/* Desktop Masonry: visible on desktop/tablet */}
              <div className={styles.desktopMasonry}>
                <div className={styles.masonryCol}>
                  {leftColPosts.map((post, idx) => (
                    <BlogCard key={post.slug} post={post} idx={idx * 2} />
                  ))}
                </div>
                <div className={styles.masonryCol}>
                  {rightColPosts.map((post, idx) => (
                    <BlogCard key={post.slug} post={post} idx={idx * 2 + 1} />
                  ))}
                </div>
              </div>

              {/* Mobile List: visible on mobile only */}
              <div className={styles.mobileList}>
                {filtered.slice(0, visibleCount).map((post, idx) => (
                  <BlogCard key={post.slug} post={post} idx={idx} />
                ))}
              </div>
            </>
          )}

          {filtered.length > visibleCount && (
            <div className={styles.showMoreWrapper}>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className={styles.showMoreBtn}
              >
                Show More Articles
              </button>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className={styles.blogSidebar}>
          {/* Recent Posts widget */}
          {finalRecentPosts.length > 0 && (
            <div className={styles.sidebarWidget}>
              <h3 className={styles.widgetTitle}>Recent Posts</h3>
              <div className={styles.recentPostsList}>
                {finalRecentPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.recentPostItem}>
                    <div className={styles.recentPostThumb}>
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="64px"
                        />
                      ) : (
                        <div className={styles.recentPostThumbFallback} />
                      )}
                    </div>
                    <div className={styles.recentPostMeta}>
                      <h4 className={styles.recentPostTitle}>{post.title}</h4>
                      <span className={styles.recentPostDate}>{formatDate(post.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories widget */}
          {allCategories.length > 0 && (
            <div className={styles.sidebarWidget}>
              <h3 className={styles.widgetTitle}>Categories</h3>
              <ul className={styles.categoriesList}>
                <li>
                  <button
                    type="button"
                    onClick={() => { setActiveTag(''); setQuery(''); }}
                    className={`${styles.categoryLink} ${!activeTag ? styles.categoryLinkActive : ''}`}
                  >
                    All
                  </button>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => { setActiveTag(cat); setQuery(''); }}
                      className={`${styles.categoryLink} ${activeTag === cat ? styles.categoryLinkActive : ''}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

    </div>
  );
}
