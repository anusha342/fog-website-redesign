import { NextResponse } from 'next/server';
import {
  getAllTestimonialsFromS3,
  putTestimonialToS3,
  testimonialSlugExistsInS3,
} from '@/lib/s3';
import type { Testimonial } from '@/lib/testimonials';

// ── Shared server-side validation ─────────────────────────────────────────────
const REQUIRED = [
  'name', 'slug', 'company', 'designation', 'product', 'location', 'body',
] as const;

function serverValidate(body: Record<string, unknown>): string | null {
  for (const key of REQUIRED) {
    if (!body[key] || String(body[key]).trim() === '') {
      return `Missing required field: ${key}`;
    }
  }
  return null;
}

/** GET /api/admin/testimonials — list all testimonials (metadata only) */
export async function GET() {
  try {
    const testimonials = await getAllTestimonialsFromS3();
    return NextResponse.json(testimonials);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list testimonials';
    console.error('GET /api/admin/testimonials error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/admin/testimonials — create a new testimonial */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, unknown>;

    const validationError = serverValidate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const slug = String(body.slug).trim();

    // Block duplicate slugs
    if (await testimonialSlugExistsInS3(slug)) {
      return NextResponse.json(
        { error: `A testimonial with slug "${slug}" already exists.` },
        { status: 409 },
      );
    }

    const testimonial: Testimonial = {
      slug,
      name:        String(body.name).trim(),
      company:     String(body.company).trim(),
      designation: String(body.designation).trim(),
      rating:      5, // hardcoded — kept for TestimonialCard star display
      product:     String(body.product).trim(),
      location:    String(body.location).trim(),
      avatar:      String(body.avatar  ?? '').trim(),
      logo:        String(body.logo    ?? '').trim(),
      body:        String(body.body).trim(),
    };

    await putTestimonialToS3(testimonial);

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create testimonial';
    console.error('POST /api/admin/testimonials error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
