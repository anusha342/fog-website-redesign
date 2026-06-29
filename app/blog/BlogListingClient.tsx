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

function BlogCard({ post, idx, isMobile = false }: { post: Post; idx: number; isMobile?: boolean }) {
  // Alternating masonry sizes patterns (balanced row-by-row):
  // Row 1: Left (idx 0) is Large, Right (idx 1) is Small
  // Row 2: Left (idx 2) is Small, Right (idx 3) is Large
  // Row 3: Left (idx 4) is Large, Right (idx 5) is Small
  // Row 4: Left (idx 6) is Small, Right (idx 7) is Large
  const isLarge = useMemo(() => {
    if (isMobile) return false;
    const pos = idx % 4;
    return pos === 0 || pos === 3;
  }, [idx, isMobile]);

  return (
    <div
      className={styles.articleCard}
      data-reveal
      data-reveal-delay={String((idx % 2) * 0.12)}
    >
      <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={`${styles.cardImgWrap} ${isLarge ? styles.cardImgLarge : styles.cardImgSmall}`}>
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
  const [activeCategory, setActiveCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isTabActive = (catName: string) => {
    const current = activeCategory.toLowerCase();
    const target = catName.toLowerCase();
    if (!current && !target) return true;
    if (current === target) return true;
    if (current === 'announcements' && target === 'announcement') return true;
    if (current === 'announcement' && target === 'announcements') return true;
    return false;
  };

  // Fallback to slice first posts if recentPosts is empty
  const finalRecentPosts = useMemo(() => {
    if (recentPosts && recentPosts.length > 0) return recentPosts;
    return posts.slice(0, 3);
  }, [recentPosts, posts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCategory]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = activeCategory.toLowerCase();
    return posts.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));

      // Match category tab (handles Announcements -> announcement singular/plural)
      const matchesCategory =
        !cat ||
        (p.category ?? '').toLowerCase() === cat ||
        ((p.category ?? '').toLowerCase() === 'announcement' && cat === 'announcements');

      return matchesQuery && matchesCategory;
    });
  }, [posts, query, activeCategory]);

  // Pagination math
  const POSTS_PER_PAGE = 6;
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filtered.slice(start, start + POSTS_PER_PAGE);
  }, [filtered, currentPage]);

  // Split into left and right columns for masonry layout
  const leftColPosts = useMemo(() => {
    return paginatedPosts.filter((_, idx) => idx % 2 === 0);
  }, [paginatedPosts]);

  const rightColPosts = useMemo(() => {
    return paginatedPosts.filter((_, idx) => idx % 2 === 1);
  }, [paginatedPosts]);

  useScrollReveal(paginatedPosts);

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
              onClick={() => { setActiveCategory(tab); setQuery(''); setSearchOpen(false); }}
              className={`${styles.filterTab}${isTabActive(tab) && !query ? ` ${styles.filterTabActive}` : ''}`}
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
              onChange={(e) => { setQuery(e.target.value); setActiveCategory(''); }}
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
              {query ? `No posts match "${query}".` : 'No posts yet — check back soon.'}
            </p>
          ) : (
            <>
              {/* Desktop Masonry: visible on desktop/tablet */}
              <div className={styles.desktopMasonry}>
                <div className={styles.masonryCol}>
                  {leftColPosts.map((post, idx) => (
                    <BlogCard key={post.slug} post={post} idx={(currentPage - 1) * POSTS_PER_PAGE + idx * 2} />
                  ))}
                </div>
                <div className={styles.masonryCol}>
                  {rightColPosts.map((post, idx) => (
                    <BlogCard key={post.slug} post={post} idx={(currentPage - 1) * POSTS_PER_PAGE + idx * 2 + 1} />
                  ))}
                </div>
              </div>

              {/* Mobile List: visible on mobile only */}
              <div className={styles.mobileList}>
                {paginatedPosts.map((post, idx) => (
                  <BlogCard key={post.slug} post={post} idx={(currentPage - 1) * POSTS_PER_PAGE + idx} isMobile={true} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {currentPage > 1 && (
                    <button
                      type="button"
                      onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                      className={styles.pageBtn}
                    >
                      Prev
                    </button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setCurrentPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                      className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button
                      type="button"
                      onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                      className={styles.pageBtn}
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </>
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
                    onClick={() => { setActiveCategory(''); setQuery(''); }}
                    className={`${styles.categoryLink} ${!activeCategory ? styles.categoryLinkActive : ''}`}
                  >
                    All
                  </button>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => { setActiveCategory(cat); setQuery(''); }}
                      className={`${styles.categoryLink} ${isTabActive(cat) ? styles.categoryLinkActive : ''}`}
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
