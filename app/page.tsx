import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'FOG Technologies — Future of Gaming',
  description:
    'FOG Technologies builds immersive family entertainment products — HyperGrid LED floors, Laser Tag, Laser Spy, and Moments AI. 10,000+ daily players across 10+ countries.',
  openGraph: {
    title: 'FOG Technologies — Future of Gaming',
    description:
      'Immersive family entertainment products for venues globally. ROI-first design, player-first experience.',
    url: 'https://futureofgaming.tech',
    siteName: 'FOG Technologies',
    images: [{ url: '/images/company_logo.png', width: 1200, height: 630, alt: 'FOG Technologies' }],
    locale: 'en_US',
    type: 'website',
  },
  alternates: { canonical: 'https://futureofgaming.tech' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://futureofgaming.tech/#organization',
      name: 'FOG Technologies Pvt. Ltd.',
      alternateName: 'Future of Gaming',
      url: 'https://futureofgaming.tech',
      logo: 'https://futureofgaming.tech/images/company_logo.png',
      email: 'futureofgamingtech@gmail.com',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://futureofgaming.tech/#website',
      url: 'https://futureofgaming.tech',
      name: 'FOG Technologies',
      publisher: { '@id': 'https://futureofgaming.tech/#organization' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://futureofgaming.tech/#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://futureofgaming.tech' },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
