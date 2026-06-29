import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import type { PostMeta, Post } from './blog';
import type { TestimonialMeta, Testimonial } from './testimonials';

let s3Client: S3Client | null = null;

function getS3() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

function bucket()                  { return process.env.S3_BUCKET_NAME!; }
function blogsPrefix()             { return process.env.S3_BLOGS_PREFIX         || 'blogs'; }
function assetsPrefix()            { return process.env.S3_ASSETS_PREFIX        || `${blogsPrefix()}/assets`; }
function testimonialsPrefix()      { return process.env.S3_TESTIMONIALS_PREFIX  || 'testimonials'; }
function testimonialsAssetsPrefix(){ return `${testimonialsPrefix()}/assets`; }

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export function getAssetUrl(filename: string): string {
  const region = process.env.AWS_REGION || 'ap-south-1';
  return `https://${bucket()}.s3.${region}.amazonaws.com/${assetsPrefix()}/${filename}`;
}

export async function getAllPostsFromS3(): Promise<PostMeta[]> {
  const s3   = getS3();
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: bucket(),
    Prefix: `${blogsPrefix()}/`,
  }));

  if (!list.Contents?.length) return [];

  const posts = await Promise.all(
    list.Contents
      .filter((obj) => obj.Key?.endsWith('.json'))
      .map(async (obj) => {
        const res  = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: obj.Key! }));
        const text = await streamToString(res.Body as NodeJS.ReadableStream);
        const data = JSON.parse(text) as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { bodyHtml: _body, ...meta } = data;
        return meta as unknown as PostMeta;
      })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlugFromS3(slug: string): Promise<Post | null> {
  const s3 = getS3();
  try {
    const res  = await s3.send(new GetObjectCommand({
      Bucket: bucket(),
      Key: `${blogsPrefix()}/${slug}.json`,
    }));
    const text = await streamToString(res.Body as NodeJS.ReadableStream);
    const data = JSON.parse(text) as unknown as PostMeta & { bodyHtml?: string };
    return {
      ...data,
      content:     '',
      contentHtml: data.bodyHtml || '',
    } satisfies Post;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return null;
    throw err;
  }
}

export async function putPostToS3(meta: PostMeta, bodyHtml: string): Promise<void> {
  const s3 = getS3();
  await s3.send(new PutObjectCommand({
    Bucket:      bucket(),
    Key:         `${blogsPrefix()}/${meta.slug}.json`,
    Body:        JSON.stringify({ ...meta, bodyHtml }, null, 2),
    ContentType: 'application/json',
  }));
}

export async function deletePostFromS3(slug: string): Promise<void> {
  const s3 = getS3();
  await s3.send(new DeleteObjectCommand({
    Bucket: bucket(),
    Key:    `${blogsPrefix()}/${slug}.json`,
  }));
}

export async function slugExistsInS3(slug: string): Promise<boolean> {
  const s3 = getS3();
  try {
    await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: `${blogsPrefix()}/${slug}.json` }));
    return true;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return false;
    throw err;
  }
}

export { assetsPrefix, testimonialsAssetsPrefix };

// ── Testimonial helpers ───────────────────────────────────────────────────────

/** Public URL for a file uploaded to the testimonials assets folder. */
export function getTestimonialAssetUrl(filename: string): string {
  const region = process.env.AWS_REGION || 'ap-south-1';
  return `https://${bucket()}.s3.${region}.amazonaws.com/${testimonialsAssetsPrefix()}/${filename}`;
}

/** List all testimonials from S3 (metadata only, no body), sorted A–Z by name. */
export async function getAllTestimonialsFromS3(): Promise<TestimonialMeta[]> {
  const s3   = getS3();
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: bucket(),
    Prefix: `${testimonialsPrefix()}/`,
  }));

  if (!list.Contents?.length) return [];

  const testimonials = await Promise.all(
    list.Contents
      .filter((obj) => obj.Key?.endsWith('.json'))
      .map(async (obj) => {
        const res  = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: obj.Key! }));
        const text = await streamToString(res.Body as NodeJS.ReadableStream);
        const data = JSON.parse(text) as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { body: _body, ...meta } = data;
        return meta as unknown as TestimonialMeta;
      })
  );

  return testimonials.sort((a, b) => a.name.localeCompare(b.name));
}

/** List all testimonials from S3 including body — used by the public site. */
export async function getAllTestimonialsWithBodyFromS3(): Promise<Testimonial[]> {
  const s3   = getS3();
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: bucket(),
    Prefix: `${testimonialsPrefix()}/`,
  }));

  if (!list.Contents?.length) return [];

  const testimonials = await Promise.all(
    list.Contents
      .filter((obj) => obj.Key?.endsWith('.json'))
      .map(async (obj) => {
        const res  = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: obj.Key! }));
        const text = await streamToString(res.Body as NodeJS.ReadableStream);
        return JSON.parse(text) as Testimonial;
      })
  );

  return testimonials.sort((a, b) => a.name.localeCompare(b.name));
}

/** Fetch a single testimonial (full, including body) by slug. Returns null if not found. */
export async function getTestimonialBySlugFromS3(slug: string): Promise<Testimonial | null> {
  const s3 = getS3();
  try {
    const res  = await s3.send(new GetObjectCommand({
      Bucket: bucket(),
      Key: `${testimonialsPrefix()}/${slug}.json`,
    }));
    const text = await streamToString(res.Body as NodeJS.ReadableStream);
    return JSON.parse(text) as Testimonial;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return null;
    throw err;
  }
}

/** Create or overwrite a testimonial in S3. */
export async function putTestimonialToS3(testimonial: Testimonial): Promise<void> {
  const s3 = getS3();
  await s3.send(new PutObjectCommand({
    Bucket:      bucket(),
    Key:         `${testimonialsPrefix()}/${testimonial.slug}.json`,
    Body:        JSON.stringify(testimonial, null, 2),
    ContentType: 'application/json',
  }));
}

/** Permanently delete a testimonial from S3 by slug. */
export async function deleteTestimonialFromS3(slug: string): Promise<void> {
  const s3 = getS3();
  await s3.send(new DeleteObjectCommand({
    Bucket: bucket(),
    Key:    `${testimonialsPrefix()}/${slug}.json`,
  }));
}

/** Returns true if a testimonial with the given slug already exists in S3. */
export async function testimonialSlugExistsInS3(slug: string): Promise<boolean> {
  const s3 = getS3();
  try {
    await s3.send(new GetObjectCommand({
      Bucket: bucket(),
      Key: `${testimonialsPrefix()}/${slug}.json`,
    }));
    return true;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return false;
    throw err;
  }
}

// ── Subscribers helpers ─────────────────────────────────────────────────────

export async function getSubscribers(): Promise<string[]> {
  const s3 = getS3();
  try {
    const res = await s3.send(new GetObjectCommand({
      Bucket: bucket(),
      Key: 'subscribers/list.json',
    }));
    const text = await streamToString(res.Body as NodeJS.ReadableStream);
    const emails = JSON.parse(text);
    if (Array.isArray(emails)) {
      return emails.map(String).map(e => e.trim().toLowerCase()).filter(Boolean);
    }
    return [];
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return [];
    throw err;
  }
}

export async function saveSubscribers(emails: string[]): Promise<void> {
  const s3 = getS3();
  const normalised = Array.from(new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean)));
  await s3.send(new PutObjectCommand({
    Bucket: bucket(),
    Key: 'subscribers/list.json',
    Body: JSON.stringify(normalised, null, 2),
    ContentType: 'application/json',
  }));
}
