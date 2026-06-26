import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPostsFromS3, getPostBySlugFromS3 } from '@/lib/s3';
import PostTocClient from './PostTocClient';
import styles from './page.module.css';

// ISR: re-render on demand, cache for 60s — new posts appear without a redeploy
export const revalidate = 60;
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

function formatDateNumeric(iso: string) {
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

/** Extract h2/h3 headings from rendered HTML, returning slug-safe IDs + text */
function extractHeadings(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h[23]>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (id) headings.push({ id, text, level });
  }
  return headings;
}

/** Inject id attributes into h2/h3 tags so anchor links resolve */
function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (_, level, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlugFromS3(slug);
  if (!post) notFound();

  const allPosts = await getAllPostsFromS3();
  const morePosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const processedHtml = injectHeadingIds(post.contentHtml)
    .replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?(?:Want to know more about deploying|Ready to run the numbers|Questions about the upgrade)[\s\S]*?<\/p>/gi, '')
    .replace(/\s*<hr>\s*$/i, '');
  const headings = extractHeadings(post.contentHtml);

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

      <section className={styles.postPage}>
        <div className={styles.postContainer}>

          {/* ── BACK BUTTON ── */}
          <div className={styles.backRow}>
            <Link href="/blog" className={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to Blog
            </Link>
          </div>

          {/* ── HEADER: meta + title + excerpt ── */}
          <header className={styles.postHeader}>
            <div className={styles.postMeta}>
              {post.category && (
                <span className={styles.metaCategory}>{post.category}</span>
              )}
              <span className={styles.metaDate}>{formatDate(post.date)}</span>
              {post.readTime && (
                <span className={styles.metaReadTime}>{post.readTime} min read</span>
              )}
            </div>
            <h1 className={styles.postTitle}>{post.title}</h1>
            {post.excerpt && (
              <p className={styles.postExcerpt}>{post.excerpt}</p>
            )}
          </header>

          {/* ── COVER IMAGE ── */}
          {post.coverImage && (
            <div className={styles.postCover}>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
            </div>
          )}

          {/* ── TWO-COLUMN LAYOUT ── */}
          <div className={styles.postLayout}>

            {/* Left — prose + end CTA */}
            <article className={styles.prose}>
              <div
                className={styles.postBody}
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />
              <hr className={styles.postDivider} />
            </article>

            {/* Right panel — ToC + progress + share + CTA */}
            <PostTocClient headings={headings} slug={slug} />

          </div>

          {/* ── MORE POSTS ── */}
          {morePosts.length > 0 && (
            <section className={styles.morePosts} aria-label="More articles">
              <div className={styles.morePostsHeader}>
                <h2 className={styles.morePostsTitle}>More from the Blog</h2>
                <Link href="/blog" className={styles.morePostsViewAll}>
                  View all
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: '4px' }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
              <div className={styles.morePostsGrid}>
                {morePosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className={styles.morePostCard}
                  >
                    <div className={styles.morePostImg}>
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className={styles.morePostImgFallback} />
                      )}
                    </div>
                    <div className={styles.morePostBody}>
                      <h3 className={styles.morePostTitle}>{p.title}</h3>
                      <div className={styles.morePostMeta}>
                        <span>{formatDateNumeric(p.date)}</span>
                        {p.readTime && (
                          <>
                            <span className={styles.morePostMetaDot}>&bull;</span>
                            <span>{p.readTime} MIN READ</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </section>
    </>
  );
}
