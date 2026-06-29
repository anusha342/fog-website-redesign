import { NextResponse } from 'next/server';
import { getPostBySlugFromS3, deletePostFromS3, putPostToS3 } from '@/lib/s3';
import { broadcastAnnouncement } from '@/lib/broadcast';
import type { PostMeta } from '@/lib/blog';

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

/** PUT /api/admin/blogs/[slug] — update an existing post */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json() as Record<string, unknown>;

    // Required field check (same rules as POST)
    const REQUIRED = ['title', 'slug', 'date', 'author', 'category', 'excerpt'] as const;
    for (const key of REQUIRED) {
      if (!body[key] || String(body[key]).trim() === '') {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }
    const rt = Number(body.readTime);
    if (isNaN(rt) || rt < 1) {
      return NextResponse.json({ error: 'readTime must be a number >= 1' }, { status: 400 });
    }

    // Slug in URL must match slug in body — prevents accidental cross-write
    if (String(body.slug).trim() !== slug) {
      return NextResponse.json(
        { error: 'Slug in body does not match URL slug.' },
        { status: 400 }
      );
    }

    // Post must already exist
    const existing = await getPostBySlugFromS3(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    const category = String(body.category).trim();
    const catLower = category.toLowerCase();
    const isAnnouncementOrUpdate = 
      catLower === 'announcement' || 
      catLower === 'announcements' || 
      catLower === 'updates' || 
      catLower === 'update';

    // If it was already broadcasted, keep it as broadcasted.
    // If it is an announcement/update now, but wasn't broadcasted before, we will broadcast it.
    const shouldBroadcast = isAnnouncementOrUpdate && !existing.broadcasted;
    const broadcasted = existing.broadcasted || shouldBroadcast;

    const meta: PostMeta = {
      slug,
      title:      String(body.title).trim(),
      date:       String(body.date).trim(),
      author:     String(body.author).trim(),
      category,
      excerpt:    String(body.excerpt).trim(),
      coverImage: String(body.coverImage ?? '').trim(),
      tags:       Array.isArray(body.tags) ? (body.tags as string[]).map(String) : [],
      readTime:   Number(body.readTime),
      broadcasted,
    };

    const bodyHtml = String(body.bodyHtml ?? '');
    await putPostToS3(meta, bodyHtml);

    if (shouldBroadcast) {
      // Trigger broadcast asynchronously so it does not block user redirect
      broadcastAnnouncement(meta).catch((err) => {
        console.error('Failed to broadcast updated blog post announcement:', err);
      });
    }

    return NextResponse.json({ ok: true, slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update post';
    console.error('PUT /api/admin/blogs/[slug] error:', message);
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
