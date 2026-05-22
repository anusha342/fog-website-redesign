'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Hide navbar on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY.current && currentY > 80) {
      setNavHidden(true);
    } else {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('get-in-touch');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setMenuOpen(false);
  };

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
        <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/#products-wrapper" onClick={() => setMenuOpen(false)}>Products</Link>
        <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
        <a href="#get-in-touch" onClick={scrollToContact}>Contact</a>
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
            <li><Link href="/#products-wrapper">Products</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><a href="#get-in-touch" onClick={scrollToContact}>Contact</a></li>
          </ul>

          <button className="nav-cta" id="nav-cta-btn" onClick={scrollToContact}>
            Get In Touch
          </button>

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
