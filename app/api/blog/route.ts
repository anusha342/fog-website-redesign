import { NextResponse } from 'next/server';
import { getAllPostsFromS3 } from '@/lib/s3';

export async function GET() {
  const postsData = await getAllPostsFromS3();
  const posts = postsData.map((p) => ({
    id:       p.slug,
    title:    p.title,
    category: p.category,
    date:     p.date,
    readTime: p.readTime,
    image:    p.coverImage,
    excerpt:  p.excerpt,
  }));

  return NextResponse.json(posts);
}
