import type { Metadata } from 'next';
import HyperGridClient from './HyperGridClient';
import { getAllTestimonials } from '@/lib/testimonials';

export const metadata: Metadata = {
  title: 'HyperGrid - FOG Technologies',
  description: 'The modular, sensor-activated LED gaming floor designed to transform any space into a high-intensity multiplayer arena.',
  openGraph: {
    title: 'HyperGrid - FOG Technologies',
    description: 'The modular, sensor-activated LED gaming floor designed to transform any space into a high-intensity multiplayer arena.',
    url: 'https://futureofgaming.tech/products/hyper-grid',
    images: [{ url: '/images/hyper-grid/hyper-grid-1.png', width: 1200, height: 630, alt: 'HyperGrid LED Gaming Floor' }],
  },
  alternates: {
    canonical: 'https://futureofgaming.tech/products/hyper-grid',
  },
};

export default async function HyperGridPage() {
  const testimonials = await getAllTestimonials();

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'HyperGrid',
    image: 'https://futureofgaming.tech/images/hyper-grid/hyper-grid-1.png',
    description: 'The modular, sensor-activated LED gaming floor designed to transform any space into a high-intensity multiplayer arena.',
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
        name: 'HyperGrid',
        item: 'https://futureofgaming.tech/products/hyper-grid',
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
      <HyperGridClient testimonials={testimonials} />
    </>
  );
}
