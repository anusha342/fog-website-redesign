import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES      = 4 * 1024 * 1024; // 4 MB — stays within Vercel's serverless limit

function getS3() {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WebP and GIF images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File must be smaller than 4 MB.' },
        { status: 400 }
      );
    }

    const bucket = process.env.S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION || 'ap-south-1';
    const blogsPrefix = process.env.S3_BLOGS_PREFIX || 'blogs';
    const prefix = process.env.S3_ASSETS_PREFIX || `${blogsPrefix}/assets`;

    const uuid     = randomUUID();
    const safeName = sanitizeName(file.name) || 'image';
    const key      = `${prefix}/${uuid}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    await getS3().send(new PutObjectCommand({
      Bucket:      bucket,
      Key:         key,
      Body:        buffer,
      ContentType: file.type,
    }));

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return NextResponse.json({ url, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('POST /api/admin/upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
