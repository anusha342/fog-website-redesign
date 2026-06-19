import type { Metadata } from 'next';
import Image from 'next/image';
import { getAllPostsFromS3 } from '@/lib/s3';
import styles from './page.module.css';
import BlogListingClient from './BlogListingClient';

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

export default async function BlogPage() {
  const allPosts = await getAllPostsFromS3();
  const recentPosts = allPosts.slice(0, 6);
  const allCategories = [
    ...new Set(allPosts.map((p) => p.category).filter(Boolean)),
  ] as string[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <header className={styles.blogHero}>
        {/* Background photo */}
        <div className={styles.blogHeroBgImg} aria-hidden="true">
          <Image
            src="/images/Blog/blog2.jpg"
            alt="FOG Technologies Blog"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </div>

        {/* Tech scanlines and ambient overlay */}
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.blogHeroOverlay} aria-hidden="true" />

        {/* HUD Corners for futuristic aesthetic */}
        <div className={`${styles.hudCorner} ${styles.hudTl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudTr}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudBl}`} aria-hidden="true" />
        <div className={`${styles.hudCorner} ${styles.hudBr}`} aria-hidden="true" />

        {/* Centered text */}
        <div className={styles.blogHeroContent}>
          <p className={styles.blogHeroEyebrow} data-reveal data-reveal-delay="0">Insights &amp; Intel</p>
          <h1 className={styles.blogHeroTitle} data-reveal data-reveal-delay="0.12">News &amp; Blogs</h1>
        </div>

        {/* Scroll cue */}
        <div className={styles.blogHeroScrollIndicator} aria-hidden="true">
          <div className={styles.blogScrollLine}>
            <div className={styles.blogScrollDot} />
          </div>
        </div>
      </header>

      <section className={styles.blogSection}>
        <div className={styles.blogContainer}>
          {/* Posts + sidebar — client component handles search/filter interactivity */}
          <BlogListingClient
            posts={allPosts}
            recentPosts={recentPosts}
            allCategories={allCategories}
          />
        </div>
      </section>
    </>
  );
}
