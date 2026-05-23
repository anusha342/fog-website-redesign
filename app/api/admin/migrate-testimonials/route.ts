import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { putTestimonialToS3 } from '@/lib/s3';
import type { Testimonial } from '@/lib/testimonials';

export async function POST() {
  try {
    const testimonialDir = path.join(process.cwd(), 'content', 'testimonials');

    if (!fs.existsSync(testimonialDir)) {
      return NextResponse.json({ migrated: [], message: 'No content/testimonials directory found.' });
    }

    const files = fs.readdirSync(testimonialDir).filter((f) => f.endsWith('.md'));
    const migrated: string[] = [];

    for (const filename of files) {
      const slug = filename.replace(/\.md$/, '');
      const raw  = fs.readFileSync(path.join(testimonialDir, filename), 'utf8');
      const { data, content } = matter(raw);

      const testimonial: Testimonial = {
        slug,
        name:        data.name        ?? '',
        company:     data.company     ?? '',
        designation: data.designation ?? '',
        rating:      Number(data.rating) || 5,
        avatar:      data.avatar      ?? '',
        logo:        data.logo        ?? '',
        product:     data.product     ?? '',
        location:    data.location    ?? '',
        body:        content.trim(),
      };

      await putTestimonialToS3(testimonial);
      migrated.push(slug);
    }

    return NextResponse.json({
      migrated,
      message: `Successfully migrated ${migrated.length} testimonial(s) to S3.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Migration failed';
    console.error('migrate-testimonials error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
