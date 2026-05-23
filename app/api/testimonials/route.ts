import { NextResponse } from 'next/server';
import { getAllTestimonialsWithBodyFromS3 } from '@/lib/s3';

export const revalidate = 60; // ISR — re-fetch from S3 every 60 seconds

/** GET /api/testimonials — public, no auth. Returns full testimonials incl. body. */
export async function GET() {
  try {
    const testimonials = await getAllTestimonialsWithBodyFromS3();
    return NextResponse.json(testimonials);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load testimonials';
    console.error('GET /api/testimonials error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
