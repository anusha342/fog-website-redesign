'use client';

import { useState, useMemo, useEffect } from 'react';
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
      .catch(() => {});
    return () => { cancelAnimationFrame(animId); };
  }, []);
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

  return (
    <div className={styles.blogInner}>

      {/* ── MAIN POSTS ── */}
      <main className={styles.postsList}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>
            {query || activeTag
              ? `No posts match "${query || activeTag}".`
              : 'No posts yet — check back soon.'}
          </p>
        ) : (
          filtered.map((post) => (
            <article key={post.slug} className={styles.postCard}>
              <Link
                href={`/blog/${post.slug}`}
                className={styles.postCardLink}
                aria-label={`Read: ${post.title}`}
              >
                {/* Cover image */}
                <div className={styles.postCardImg}>
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 767px) 100vw, 65vw"
                    />
                  ) : (
                    <div className={styles.postCardImgFallback} />
                  )}
                </div>

                {/* Body */}
                <div className={styles.postCardBody}>
                  <div className={styles.postMeta}>
                    {post.category && (
                      <span className={styles.postCategory}>{post.category}</span>
                    )}
                    <span className={styles.postDate}>{formatDate(post.date)}</span>
                  </div>
                  <h2 className={styles.postCardTitle}>{post.title}</h2>
                  {post.excerpt && (
                    <p className={styles.postCardExcerpt}>{post.excerpt}</p>
                  )}
                  <span className={styles.postReadMore}>Read More &rarr;</span>
                </div>
              </Link>
            </article>
          ))
        )}
      </main>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>

        {/* Search */}
        <div className={styles.sideWidget}>
          <h3 className={styles.sideWidgetTitle}>Search</h3>
          <div className={styles.searchForm} role="search">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveTag(''); // clear tag filter when typing
              }}
              placeholder="Search posts..."
              className={styles.searchInput}
              aria-label="Search blog posts"
            />
            <span className={styles.searchIcon} aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
          </div>
        </div>

        {/* Popular Tags */}
        {allCategories.length > 0 && (
          <div className={styles.sideWidget}>
            <h3 className={styles.sideWidgetTitle}>Popular Tags</h3>
            <div className={styles.tagCloud}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveTag(activeTag.toLowerCase() === cat.toLowerCase() ? '' : cat);
                    setQuery('');
                  }}
                  className={`${styles.tagPill}${activeTag.toLowerCase() === cat.toLowerCase() ? ` ${styles.tagPillActive}` : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className={styles.sideWidget}>
            <h3 className={styles.sideWidgetTitle}>Recent Posts</h3>
            <div className={styles.recentList}>
              {recentPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.recentItem}>
                  <div className={styles.recentThumb}>
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="68px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.recentThumbFallback} />
                    )}
                  </div>
                  <div className={styles.recentContent}>
                    <p className={styles.recentTitle}>{post.title}</p>
                    <p className={styles.recentDate}>{formatDate(post.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className={styles.ctaBanner}>
          {/* <p className={styles.ctaBannerEyebrow}>Get Started</p> */}
          <h3 className={styles.ctaBannerTitle}>Ready to Elevate Your Entertainment Venue?</h3>
          <Link href="/#get-in-touch" className={styles.ctaBannerBtn}>Get In Touch</Link>
        </div>

      </aside>
    </div>
  );
}
