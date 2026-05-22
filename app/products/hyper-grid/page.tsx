import type { Metadata } from 'next';
import HyperGridClient from './HyperGridClient';

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

export default function HyperGridPage() {
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'HyperGrid',
    image: 'https://cdn.prod.website-files.com/67345881cc5e3033153f6d9b/698b86846f2426ee6d001eb3_8afbe6ee30ff3449d3bfa4a401310e02_HyperGrid%20by%20FOG%20-%203D%20Render.webp',
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
      <HyperGridClient />
    </>
  );
}
