import { getAllTestimonialsWithBodyFromS3 } from './s3';

/** Metadata stored in S3 (no body). Used for admin list views. */
export interface TestimonialMeta {
  slug:        string;
  name:        string;
  company:     string;
  designation: string;
  /** Always 5 from admin form; kept so TestimonialCard star display keeps working. */
  rating:      number;
  avatar:      string;
  logo:        string;
  product:     string;
  location:    string;
}

/** Full testimonial including the quote body. */
export interface Testimonial extends TestimonialMeta {
  body: string;
}

/** Returns all testimonials from S3, sorted A–Z by name. */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  return getAllTestimonialsWithBodyFromS3();
}
