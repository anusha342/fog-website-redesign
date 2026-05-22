import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact FOG Technologies | Build Your Vision',
  description:
    'Get in touch with FOG Technologies. Whether you are planning a new family entertainment center or expanding an existing one, our team is here to help. Response within 24 hours.',
  openGraph: {
    title: 'Contact FOG Technologies | Future of Gaming',
    description:
      'Start your journey with FOG. Premium family entertainment solutions — HyperGrid, Laser Tag, Laser Spy, and Moments AI. Reach out today.',
    url: 'https://futureofgaming.tech/contact',
    type: 'website',
    images: [{ url: '/images/company_logo.png', width: 1200, height: 630, alt: 'Contact FOG Technologies' }],
  },
  alternates: {
    canonical: 'https://futureofgaming.tech/contact',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://futureofgaming.tech' },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://futureofgaming.tech/contact' },
      ],
    },
    {
      '@type': 'ContactPage',
      '@id': 'https://futureofgaming.tech/contact',
      url: 'https://futureofgaming.tech/contact',
      name: 'Contact FOG Technologies',
      description: 'Get in touch with FOG Technologies for premium family entertainment center attractions.',
      inLanguage: 'en',
      mainEntity: {
        '@type': 'Organization',
        name: 'FOG Technologies Pvt. Ltd.',
        email: 'futureofgamingtech@gmail.com',
        telephone: '+919876543210',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+919876543210',
            contactType: 'customer service',
            email: 'futureofgamingtech@gmail.com',
            availableLanguage: 'English',
          },
        ],
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
