import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPostsFromS3 } from '@/lib/s3';
import styles from './page.module.css';

// Revalidate every 60 seconds — new posts appear without a redeploy
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog — Insights & Updates | FOG Technologies',
  description:
    'Engineering breakdowns, business insights, and product news from the team building the future of location-based entertainment.',
  openGraph: {
    title: 'Blog — FOG Technologies',
    description: 'Industry insights, operator case studies, and product updates from FOG Technologies.',
    url: 'https://futureofgaming.tech/blog',
    siteName: 'FOG Technologies',
    images: [{ url: '/images/company_logo.png', width: 1200, height: 630, alt: 'FOG Technologies Blog' }],
    type: 'website',
  },
  alternates: { canonical: 'https://futureofgaming.tech/blog' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': 'https://futureofgaming.tech/blog/#blog',
      name: 'FOG Technologies Blog',
      url: 'https://futureofgaming.tech/blog',
      description: 'Industry insights and product updates from FOG Technologies.',
      publisher: { '@id': 'https://futureofgaming.tech/#organization' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://futureofgaming.tech' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://futureofgaming.tech/blog' },
      ],
    },
  ],
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function BlogPage() {
  const posts = await getAllPostsFromS3();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className={styles.pageHero} aria-label="Blog hero">
        <div className={styles.pageHeroInner}>
          <p className={styles.pageEyebrow}>Insights &amp; Updates</p>
          <h1 className={styles.pageTitle}>From the FOG Lab</h1>
          <p className={styles.pageSubtitle}>
            Engineering breakdowns, business insights, and product news from the team
            building the future of location-based entertainment.
          </p>
        </div>
      </section>

      {/* ── GRID ── */}
      <div className={styles.gridWrap}>
        <div className={styles.gridInner}>
          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. Check back soon.</p>
          ) : (
            <ul className={styles.grid} role="list">
              {posts.map((post) => (
                <li key={post.slug} className={styles.card}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={styles.cardLink}
                    aria-label={`Read: ${post.title}`}
                  >
                    {/* Cover image */}
                    <div className={styles.cardImg}>
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#1C1C1C' }} />
                      )}
                    </div>

                    {/* Body */}
                    <div className={styles.cardBody}>
                      <p className={styles.cardCat}>{post.category}</p>
                      <h2 className={styles.cardTitle}>{post.title}</h2>
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>
                      <p className={styles.cardMeta}>
                        {post.author}&nbsp;&middot;&nbsp;{formatDate(post.date)}&nbsp;&middot;&nbsp;{post.readTime}&nbsp;min read
                      </p>
                      <span className={styles.cardCta}>Read More &#x2192;</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
