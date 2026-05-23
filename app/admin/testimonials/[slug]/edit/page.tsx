import { notFound } from 'next/navigation';
import { getTestimonialBySlugFromS3 } from '@/lib/s3';
import TestimonialForm from '@/components/admin/TestimonialForm';

type Props = { params: Promise<{ slug: string }> };

export default async function EditTestimonialPage({ params }: Props) {
  const { slug } = await params;
  const testimonial = await getTestimonialBySlugFromS3(slug);
  if (!testimonial) notFound();

  return <TestimonialForm mode="edit" initialTestimonial={testimonial} />;
}
