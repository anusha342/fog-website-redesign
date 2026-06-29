import { NextResponse } from 'next/server';
import { getAllPostsFromS3, putPostToS3, slugExistsInS3 } from '@/lib/s3';
import { broadcastAnnouncement } from '@/lib/broadcast';
import type { PostMeta } from '@/lib/blog';

// ── Shared server-side validation ─────────────────────────────────────────────
const REQUIRED = ['title', 'slug', 'date', 'author', 'category', 'excerpt'] as const;

function serverValidate(body: Record<string, unknown>): string | null {
  for (const key of REQUIRED) {
    if (!body[key] || String(body[key]).trim() === '') {
      return `Missing required field: ${key}`;
    }
  }
  const rt = Number(body.readTime);
  if (isNaN(rt) || rt < 1) return 'readTime must be a number >= 1';
  return null;
}

/** GET /api/admin/blogs — list all posts (metadata only) */
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

/** POST /api/admin/blogs — create a new blog post */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, unknown>;

    const validationError = serverValidate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const slug = String(body.slug).trim();

    // Block duplicate slugs
    if (await slugExistsInS3(slug)) {
      return NextResponse.json(
        { error: `A post with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const category = String(body.category).trim();
    const catLower = category.toLowerCase();
    const isAnnouncement = catLower === 'announcement' || catLower === 'announcements';

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
      broadcasted: isAnnouncement,
    };

    const bodyHtml = String(body.bodyHtml ?? '');
    await putPostToS3(meta, bodyHtml);

    if (isAnnouncement) {
      // Trigger broadcast asynchronously so it does not hold up admin UI redirect
      broadcastAnnouncement(meta).catch((err) => {
        console.error('Failed to broadcast newly created blog post:', err);
      });
    }

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post';
    console.error('POST /api/admin/blogs error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
