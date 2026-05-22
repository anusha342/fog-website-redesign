import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const TESTIMONIALS_DIR = path.join(process.cwd(), 'content', 'testimonials');

export interface Testimonial {
  slug: string;
  name: string;
  company: string;
  designation: string;
  rating: number;
  avatar: string;
  logo: string;
  product: string;
  location: string;
  body: string;
}

export function getAllTestimonials(): Testimonial[] {
  if (!fs.existsSync(TESTIMONIALS_DIR)) return [];

  return fs
    .readdirSync(TESTIMONIALS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const raw  = fs.readFileSync(path.join(TESTIMONIALS_DIR, filename), 'utf8');
      const { data, content } = matter(raw);
      return {
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
      } satisfies Testimonial;
    });
}
