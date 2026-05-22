import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  coverImage: string;
  category: string;
  tags: string[];
  readTime: number;
}

export interface Post extends PostMeta {
  content: string;
  contentHtml: string;
}

// ── Markdown → HTML (no external dependencies) ──────────────────────────────
export function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (/^### /.test(line)) { blocks.push(`<h3>${inline(line.slice(4))}</h3>`); i++; continue; }
    if (/^## /.test(line))  { blocks.push(`<h2>${inline(line.slice(3))}</h2>`); i++; continue; }
    if (/^# /.test(line))   { blocks.push(`<h1>${inline(line.slice(2))}</h1>`); i++; continue; }

    // HR
    if (/^---+$/.test(line.trim())) { blocks.push('<hr>'); i++; continue; }

    // Blockquote (multi-line)
    if (/^> /.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length && /^> /.test(lines[i])) {
        bqLines.push(inline(lines[i].slice(2)));
        i++;
      }
      blocks.push(`<blockquote><p>${bqLines.join('<br>')}</p></blockquote>`);
      continue;
    }

    // Unordered list
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank line — skip
    if (line.trim() === '') { i++; continue; }

    // Paragraph (gather until blank line)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#|>|- |\d+\. |---)/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push(`<p>${inline(paraLines.join(' '))}</p>`);
    }
  }

  return blocks.join('\n');
}

function inline(text: string): string {
  return text
    // Images before links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

// ── Data access ──────────────────────────────────────────────────────────────
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const raw  = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
      const { data } = matter(raw);
      return {
        slug,
        title:      data.title      ?? '',
        date:       data.date       ?? '',
        excerpt:    data.excerpt    ?? '',
        author:     data.author     ?? '',
        coverImage: data.coverImage ?? '',
        category:   data.category   ?? '',
        tags:       Array.isArray(data.tags) ? data.tags : [],
        readTime:   Number(data.readTime)    || 5,
      } satisfies PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title:       data.title      ?? '',
    date:        data.date       ?? '',
    excerpt:     data.excerpt    ?? '',
    author:      data.author     ?? '',
    coverImage:  data.coverImage ?? '',
    category:    data.category   ?? '',
    tags:        Array.isArray(data.tags) ? data.tags : [],
    readTime:    Number(data.readTime)    || 5,
    content,
    contentHtml: markdownToHtml(content),
  };
}
