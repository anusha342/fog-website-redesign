'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [productsActive, setProductsActive] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  // Hide navbar on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY.current && currentY > 80) {
      setNavHidden(true);
    } else {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;

    // Check if products section is in view (only on home page)
    if (pathname === '/') {
      const el = document.getElementById('products-wrapper');
      if (el) {
        const rect = el.getBoundingClientRect();
        // Active if top of section is above 30% of viewport and bottom is below 30%
        setProductsActive(rect.top < window.innerHeight * 0.3 && rect.bottom > window.innerHeight * 0.3);
      }
    } else {
      setProductsActive(false);
    }
  }, [pathname]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={menuOpen ? 'open' : ''}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          className="mobile-close"
          id="mobile-close-btn"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          &#x2715;
        </button>
        <Link href="/about" className={pathname === '/about' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/#products-wrapper" className={productsActive ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>Products</Link>
        <Link href="/blog" className={pathname.startsWith('/blog') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link href="/contact" className={pathname === '/contact' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>Contact</Link>
      </div>

      {/* NAVBAR */}
      <nav
        id="navbar"
        className={navHidden ? 'nav-hidden' : ''}
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="FOG Technologies home">
            <Image
              src="/images/company_logo.png"
              alt="FOG Technologies"
              className="nav-logo-img"
              width={120}
              height={34}
              priority
            />
          </Link>

          <ul className="nav-links" role="list">
            <li><Link href="/#products-wrapper" className={productsActive ? 'nav-active' : ''}>Products</Link></li>
            <li><Link href="/about" className={pathname === '/about' ? 'nav-active' : ''}>About</Link></li>
            <li><Link href="/blog" className={pathname.startsWith('/blog') ? 'nav-active' : ''}>Blog</Link></li>
            <li><Link href="/contact" className={pathname === '/contact' ? 'nav-active' : ''}>Contact</Link></li>
          </ul>

          <Link href="/contact" className="nav-cta">
            Get In Touch
          </Link>

          <button
            className="hamburger"
            id="hamburger-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </>
  );
}
