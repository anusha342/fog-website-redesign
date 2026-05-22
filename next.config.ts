import type { NextConfig } from "next";

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
