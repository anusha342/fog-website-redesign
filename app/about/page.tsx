import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About FOG Technologies | Family Entertainment Innovation',
  description:
    'Learn how FOG Technologies — Future of Gaming — builds HyperGrid, Laser Tag, Laser Spy & Moments AI for FECs across 10+ countries. Our story, values, and team.',
  openGraph: {
    title: 'About FOG Technologies | Future of Gaming',
    description:
      'Premium B2B family entertainment manufacturer. Meet the team behind HyperGrid, Laser Tag, Laser Spy, and Moments AI — operating in 10+ countries.',
    url: 'https://futureofgaming.tech/about',
    type: 'website',
    images: ['/images/company_logo.png'],
  },
  alternates: {
    canonical: 'https://futureofgaming.tech/about',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://futureofgaming.tech' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://futureofgaming.tech/about' },
      ],
    },
    {
      '@type': 'AboutPage',
      '@id': 'https://futureofgaming.tech/about',
      url: 'https://futureofgaming.tech/about',
      name: 'About FOG Technologies',
      description:
        'FOG Technologies (Future of Gaming) manufactures and deploys premium location-based entertainment attractions — HyperGrid, Laser Tag, Laser Spy, and Moments AI — for Family Entertainment Centers across 10+ countries.',
      inLanguage: 'en',
      publisher: {
        '@type': 'Organization',
        name: 'FOG Technologies Pvt. Ltd.',
        url: 'https://futureofgaming.tech',
        logo: 'https://futureofgaming.tech/images/company_logo.png',
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
