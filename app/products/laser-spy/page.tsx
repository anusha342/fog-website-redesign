import type { Metadata } from 'next';
import LaserSpyClient from './LaserSpyClient';

export const metadata: Metadata = {
  title: 'Laser Spy - FOG Technologies',
  description: 'Navigate a web of laser beams without triggering a single alarm. A stealth challenge every player wants to beat — then beat again.',
  openGraph: {
    title: 'Laser Spy - FOG Technologies',
    description: 'Navigate a web of laser beams without triggering a single alarm. A stealth challenge every player wants to beat — then beat again.',
    url: 'https://futureofgaming.tech/products/laser-spy',
  },
  alternates: {
    canonical: 'https://futureofgaming.tech/products/laser-spy',
  },
};

export default function LaserSpyPage() {
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Laser Spy',
    image: 'https://futureofgaming.tech/images/laser-spy/laser-spy-1.jpg',
    description: 'Navigate a web of laser beams without triggering a single alarm. A stealth challenge every player wants to beat — then beat again.',
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
        name: 'Laser Spy',
        item: 'https://futureofgaming.tech/products/laser-spy',
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
      <LaserSpyClient />
    </>
  );
}
