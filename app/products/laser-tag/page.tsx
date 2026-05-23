import type { Metadata } from 'next';
import LaserTagClient from './LaserTagClient';
import { getAllTestimonials } from '@/lib/testimonials';

export const metadata: Metadata = {
  title: 'Laser Tag - FOG Technologies',
  description: 'Next-gen laser combat. Realistic combat-grade laser guns and futuristic sensor vests with haptic feedback inside an interactive arena.',
  openGraph: {
    title: 'Laser Tag - FOG Technologies',
    description: 'Next-gen laser combat. Realistic combat-grade laser guns and futuristic sensor vests with haptic feedback inside an interactive arena.',
    url: 'https://futureofgaming.tech/products/laser-tag',
    images: [{ url: '/images/laser-tag/laser-tag-1.png', width: 1200, height: 630, alt: 'Next-gen Laser Tag Combat' }],
  },
  alternates: {
    canonical: 'https://futureofgaming.tech/products/laser-tag',
  },
};

export default async function LaserTagPage() {
  const testimonials = await getAllTestimonials();

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Laser Tag',
    image: 'https://futureofgaming.tech/images/laser-tag/laser-tag-1.png',
    description: 'Next-gen laser combat. Realistic combat-grade laser guns and futuristic sensor vests with haptic feedback inside an interactive arena.',
    brand: {
      '@type': 'Brand',
      name: 'FOG Technologies',
    },
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://futureofgaming.tech',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://futureofgaming.tech/#products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Laser Tag',
        item: 'https://futureofgaming.tech/products/laser-tag',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <LaserTagClient testimonials={testimonials} />
    </>
  );
}
