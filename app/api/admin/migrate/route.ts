import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { putPostToS3 } from '@/lib/s3';
import { markdownToHtml } from '@/lib/blog';
import type { PostMeta } from '@/lib/blog';

export async function POST() {
  try {
    const blogDir = path.join(process.cwd(), 'content', 'blog');

    if (!fs.existsSync(blogDir)) {
      return NextResponse.json({ migrated: [], message: 'No content/blog directory found.' });
    }

    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
    const migrated: string[] = [];

    for (const filename of files) {
      const slug = filename.replace(/\.md$/, '');
      const raw  = fs.readFileSync(path.join(blogDir, filename), 'utf8');
      const { data, content } = matter(raw);

      const meta: PostMeta = {
        slug,
        title:      data.title      ?? '',
        date:       data.date       ?? '',
        excerpt:    data.excerpt    ?? '',
        author:     data.author     ?? '',
        coverImage: data.coverImage ?? '',
        category:   data.category   ?? '',
        tags:       Array.isArray(data.tags) ? data.tags : [],
        readTime:   Number(data.readTime) || 5,
      };

      const bodyHtml = markdownToHtml(content);
      await putPostToS3(meta, bodyHtml);
      migrated.push(slug);
    }

    return NextResponse.json({
      migrated,
      message: `Successfully migrated ${migrated.length} post(s) to S3.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Migration failed';
    console.error('migrate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
