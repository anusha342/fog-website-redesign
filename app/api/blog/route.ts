import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET() {
  const dir = path.join(process.cwd(), 'content/blog');

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ posts: [] });
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  const posts = files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf8');
      const { data } = matter(raw);
      return {
        id:       data.id       || filename.replace('.md', ''),
        title:    data.title    || '',
        category: data.category || '',
        date:     data.date     || '',
        readTime: Number(data.readTime) || 0,
        image:    data.image    || '',
        excerpt:  data.excerpt  || '',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ posts });
}
