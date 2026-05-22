import { NextResponse } from 'next/server';
import { getAllPostsFromS3 } from '@/lib/s3';

export async function GET() {
  try {
    const posts = await getAllPostsFromS3();
    return NextResponse.json(posts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list blogs';
    console.error('GET /api/admin/blogs error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
