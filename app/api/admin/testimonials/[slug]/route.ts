import { NextResponse } from 'next/server';
import {
  getTestimonialBySlugFromS3,
  deleteTestimonialFromS3,
  putTestimonialToS3,
} from '@/lib/s3';
import type { Testimonial } from '@/lib/testimonials';

type Params = { params: Promise<{ slug: string }> };

const REQUIRED = [
  'name', 'slug', 'company', 'designation', 'product', 'location', 'body',
] as const;

/** GET /api/admin/testimonials/[slug] — fetch a single testimonial (used by edit form) */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const testimonial = await getTestimonialBySlugFromS3(slug);
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });
    }
    return NextResponse.json(testimonial);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch testimonial';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PUT /api/admin/testimonials/[slug] — update an existing testimonial */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json() as Record<string, unknown>;

    // Required field check
    for (const key of REQUIRED) {
      if (!body[key] || String(body[key]).trim() === '') {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    // Slug in URL must match slug in body — prevents accidental cross-write
    if (String(body.slug).trim() !== slug) {
      return NextResponse.json(
        { error: 'Slug in body does not match URL slug.' },
        { status: 400 },
      );
    }

    // Testimonial must already exist
    const existing = await getTestimonialBySlugFromS3(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });
    }

    const testimonial: Testimonial = {
      slug,
      name:        String(body.name).trim(),
      company:     String(body.company).trim(),
      designation: String(body.designation).trim(),
      rating:      existing.rating ?? 5, // preserve stored rating (always 5 in practice)
      product:     String(body.product).trim(),
      location:    String(body.location).trim(),
      avatar:      String(body.avatar  ?? '').trim(),
      logo:        String(body.logo    ?? '').trim(),
      body:        String(body.body).trim(),
    };

    await putTestimonialToS3(testimonial);

    return NextResponse.json({ ok: true, slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update testimonial';
    console.error('PUT /api/admin/testimonials/[slug] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/admin/testimonials/[slug] — permanently delete a testimonial from S3 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const existing = await getTestimonialBySlugFromS3(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });
    }

    await deleteTestimonialFromS3(slug);
    return NextResponse.json({ ok: true, deleted: slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete testimonial';
    console.error('DELETE /api/admin/testimonials/[slug] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
