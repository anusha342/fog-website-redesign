import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const posts = getAllPosts().map((p) => ({
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
