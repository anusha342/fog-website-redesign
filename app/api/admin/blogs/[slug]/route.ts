import { NextResponse } from 'next/server';
import { getPostBySlugFromS3, deletePostFromS3 } from '@/lib/s3';

type Params = { params: Promise<{ slug: string }> };

/** GET /api/admin/blogs/[slug] — fetch a single post (used by edit form) */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const post = await getPostBySlugFromS3(slug);
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    return NextResponse.json(post);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/admin/blogs/[slug] — permanently delete a post from S3 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const existing = await getPostBySlugFromS3(slug);
    if (!existing) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

    await deletePostFromS3(slug);
    return NextResponse.json({ ok: true, deleted: slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete post';
    console.error('DELETE /api/admin/blogs/[slug] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
