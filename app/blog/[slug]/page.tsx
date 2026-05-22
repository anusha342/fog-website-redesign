import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPostsFromS3, getPostBySlugFromS3 } from '@/lib/s3';
import styles from './page.module.css';

// ISR: re-render on demand, cache for 60s — new posts appear without a redeploy
export const revalidate    = 60;
export const dynamicParams = true;

// Per-post metadata from frontmatter
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugFromS3(slug);
  if (!post) return { title: 'Post Not Found | FOG Technologies' };

  return {
    title: `${post.title} | FOG Technologies Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://futureofgaming.tech/blog/${post.slug}`,
      siteName: 'FOG Technologies',
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: { canonical: `https://futureofgaming.tech/blog/${post.slug}` },
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlugFromS3(slug);
  if (!post) notFound();

  const allPosts = await getAllPostsFromS3();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://futureofgaming.tech/blog/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@id': 'https://futureofgaming.tech/#organization' },
    image: post.coverImage
      ? `https://futureofgaming.tech${post.coverImage}`
      : undefined,
    keywords: post.tags.join(', '),
    url: `https://futureofgaming.tech/blog/${post.slug}`,
    isPartOf: { '@id': 'https://futureofgaming.tech/blog/#blog' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className={styles.pageHero} aria-label="Post header">
        <div className={styles.pageHeroInner}>
          <p className={styles.postEyebrow}>{post.category}</p>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <p className={styles.postHeroMeta}>
            <span>{post.author}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readTime} min read</span>
          </p>
          {post.tags.length > 0 && (
            <div className={styles.postTags} aria-label="Tags">
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SIDEBAR + CONTENT ── */}
      <div className={styles.layout}>

        {/* Sidebar: all posts as navigation tabs */}
        <nav className={styles.tabs} aria-label="Blog posts">
          <div className={styles.tabsInner}>
            {allPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className={`${styles.tab} ${p.slug === slug ? styles.tabActive : ''}`}
                aria-current={p.slug === slug ? 'page' : undefined}
              >
                <span className={styles.tabCat}>{p.category}</span>
                <span className={styles.tabTitle}>{p.title}</span>
                <span className={styles.tabMeta}>
                  {formatDate(p.date)}&nbsp;&middot;&nbsp;{p.readTime}&nbsp;min
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Post content */}
        <article className={styles.content}>
          <div className={styles.contentInner}>

            {/* Cover image */}
            {post.coverImage && (
              <div className={styles.postCover}>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, calc(100vw - 320px)"
                />
              </div>
            )}

            {/* Prose body */}
            <div
              className={styles.postBody}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* End CTA */}
            <div className={styles.postCta}>
              <p className={styles.ctaLabel}>
                Ready to bring FOG to your venue?
              </p>
              <Link href="/#get-in-touch" className={styles.ctaBtn}>
                Get In Touch &#x2192;
              </Link>
            </div>

          </div>
        </article>
      </div>
    </>
  );
}
