'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsActive, setProductsActive] = useState(false);
  const lastScrollY = useRef(0);
  const productsMenuRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  // Hide navbar on scroll down, show on scroll up; transparent at top
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setScrolled(currentY > 60);
    if (currentY > lastScrollY.current && currentY > 80) {
      setNavHidden(true);
    } else {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;

    // Update active products state on scroll (only on home page)
    if (pathname === '/') {
      const el = document.getElementById('products-wrapper');
      if (el) {
        const rect = el.getBoundingClientRect();
        setProductsActive(rect.top < window.innerHeight * 0.3 && rect.bottom > window.innerHeight * 0.3);
      }
    }
  }, [pathname]);

  // Synchronize scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Initialize and synchronize active state immediately on pathname change
  useEffect(() => {
    if (pathname.startsWith('/products/')) {
      setProductsActive(true);
    } else if (pathname === '/') {
      const el = document.getElementById('products-wrapper');
      if (el) {
        const rect = el.getBoundingClientRect();
        setProductsActive(rect.top < window.innerHeight * 0.3 && rect.bottom > window.innerHeight * 0.3);
      } else {
        setProductsActive(false);
      }
    } else {
      setProductsActive(false);
    }
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) setMobileProductsOpen(false);
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!productsDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setProductsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [productsDropdownOpen]);

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
        <div className="mobile-menu-header">
          <Link href="/" className="nav-logo" aria-label="FOG Technologies home" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/company_logo.png"
              alt="FOG Technologies"
              className="nav-logo-img"
              width={120}
              height={34}
              priority
            />
          </Link>
          <button
            className="mobile-close"
            id="mobile-close-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            &#x2715;
          </button>
        </div>

        <div className="mobile-menu-links">
          <Link href="/about" className={pathname === '/about' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>About</Link>
          <button
            type="button"
            className={`mobile-menu-trigger${mobileProductsOpen ? ' open' : ''}`}
            aria-expanded={mobileProductsOpen}
            onClick={() => setMobileProductsOpen((prev) => !prev)}
          >
            Products
            <svg
              className="mobile-chevron"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                marginLeft: '8px',
                transition: 'transform 200ms ease',
                transform: mobileProductsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className={`mobile-submenu${mobileProductsOpen ? ' open' : ''}`}>
            <Link href="/products/hyper-grid" onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }}>HyperGrid</Link>
            <Link href="/products/laser-tag" onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }}>Laser Tag</Link>
            <Link href="/products/laser-spy" onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }}>Laser Spy</Link>
          </div>
          <Link href="/blog" className={pathname.startsWith('/blog') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>Contact</Link>
        </div>
      </div>

      {/* NAVBAR */}
      <nav
        id="navbar"
        className={[
          navHidden ? 'nav-hidden' : '',
          (scrolled || pathname === '/contact') ? 'nav-scrolled' : ''
        ].filter(Boolean).join(' ')}
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
            <li
              className="products-menu"
              ref={productsMenuRef}
            >
              <button
                type="button"
                className={`products-trigger${(productsActive || productsDropdownOpen) ? ' nav-active' : ''}`}
                aria-haspopup="menu"
                aria-expanded={productsDropdownOpen}
                onClick={() => setProductsDropdownOpen((prev) => !prev)}
              >
                Products
                <svg
                  className="products-chevron"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    marginLeft: '6px',
                    transition: 'transform 200ms ease',
                    transform: productsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={`products-dropdown${productsDropdownOpen ? ' open' : ''}`}
                role="menu"
                aria-label="Products submenu"
              >
                <Link
                  href="/products/hyper-grid"
                  className={`products-dropdown-link${pathname === '/products/hyper-grid' ? ' dropdown-active' : ''}`}
                  onClick={() => setProductsDropdownOpen(false)}
                >
                  HyperGrid
                </Link>
                <Link
                  href="/products/laser-tag"
                  className={`products-dropdown-link${pathname === '/products/laser-tag' ? ' dropdown-active' : ''}`}
                  onClick={() => setProductsDropdownOpen(false)}
                >
                  Laser Tag
                </Link>
                <Link
                  href="/products/laser-spy"
                  className={`products-dropdown-link${pathname === '/products/laser-spy' ? ' dropdown-active' : ''}`}
                  onClick={() => setProductsDropdownOpen(false)}
                >
                  Laser Spy
                </Link>
              </div>
            </li>
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
