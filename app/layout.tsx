import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'FOG Technologies — Future of Gaming',
    template: '%s | FOG Technologies',
  },
  description:
    'FOG Technologies engineers immersive location-based entertainment products — HyperGrid, Laser Tag, Laser Spy, and Moments AI — that operators invest in and players love.',
  metadataBase: new URL('https://futureofgaming.tech'),
  openGraph: {
    siteName: 'FOG Technologies',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
