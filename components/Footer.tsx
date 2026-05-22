import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <div id="footer-wrap">
      <footer id="footer">

        <div className="footer-top">

          {/* Col 1: Brand */}
          <div className="footer-brand">
            <div className="footer-logo-box">
              <Image
                src="/images/company_logo.png"
                alt="FOG Technologies"
                className="footer-logo-img"
                width={120}
                height={32}
              />
            </div>
            <div className="footer-contact-quick">
              <a href="tel:+919876543210" className="footer-phone-sm">+91 98765 43210</a>
              <a href="mailto:contact@futureofgaming.tech" className="footer-email-sm">
                contact@futureofgaming.tech
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-nav-block">
            <div className="footer-nav-col">
              <Link href="/about">About</Link>
              <Link href="/#products-wrapper">Products</Link>
              <Link href="/#globe-section">Locations</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/#get-in-touch">Contact</Link>
              <Link href="#">Privacy Policy</Link>
            </div>
            <div className="footer-nav-col">
              <a href="#" rel="noopener noreferrer">LinkedIn</a>
              <a href="#" rel="noopener noreferrer">Instagram</a>
              <a href="#" rel="noopener noreferrer">YouTube</a>
              <a href="https://wa.me/919876543210" rel="noopener noreferrer" target="_blank">
                WhatsApp
              </a>
            </div>
          </div>

        </div>{/* /.footer-top */}

        {/* Bottom strip */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 FOG Technologies Pvt. Ltd. All rights reserved.</p>
        </div>

      </footer>
    </div>
  );
}
