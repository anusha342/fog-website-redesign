import type { NextConfig } from "next";

// Suppress Next.js dev server HTTP request logging in the terminal
if (process.env.NODE_ENV === 'development') {
  const originalWrite = process.stdout.write;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stdout as any).write = function (chunk: any, encoding?: any, callback?: any): boolean {
    const str = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    if (/\s*(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+\//i.test(str)) {
      return true; // Skip printing HTTP request logs
    }
    return originalWrite.apply(process.stdout, [chunk, encoding, callback]);
  };
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      // S3 hosted assets (cover images, inline blog images)
      {
        protocol: 'https',
        hostname: '*.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
