import { MetadataRoute } from 'next';
import { getAllPostsFromS3 } from '@/lib/s3';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://futureofgaming.tech';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/products/hyper-grid',
    '/products/laser-spy',
    '/products/laser-tag',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic blog posts
  const posts = await getAllPostsFromS3();
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
