# Project: FOG Technologies Pvt Ltd — Next.js Migration

## Old Project Location
All original files are inside `_old/` folder in the project root.

## Stack
- Next.js 15, App Router
- Tailwind CSS
- Resend (contact form emails)
- gray-matter (blog/testimonials via Markdown)

## Folder Targets
- app/ → all pages
- components/ → shared UI (Navbar, Footer, etc.)
- content/blog/ → .md files
- content/testimonials/ → .md files
- public/ → images and static assets

## CSS Strategy
Each page has its own CSS file in _old/. When migrating:
- Global styles (reset, fonts, variables) → app/globals.css
- Page-specific styles → keep as page.module.css per page
- Do NOT rewrite design, preserve it exactly

## JS Strategy
Each page has its own JS file in _old/. When migrating:
- Convert to React hooks/events inside the component
- Do not use document.getElementById patterns — use useRef or useState

## Rules
- Always App Router, never Pages Router
- Every page must have a metadata export (title, description, openGraph, canonical)
- Use next/image for every image
- Use next/link for every internal link
- JSON-LD structured data on every page
- Do not install packages not listed above

## Business Context
Family entertainment company. Goal: 10X organic traffic via SEO, AEO, GEO.
Admin email for contact form: [PUT YOUR EMAIL HERE]

## Progress Log

### Session 6 — Laser Spy Product Page Migration
- Migrated the Laser Spy product page to `app/products/laser-spy/page.tsx` as a Server Component, appending proper SEO metadata and JSON-LD structured schema (`Product` and `BreadcrumbList`).
- Processed `_old/css/laser-spy.css` into a Next.js `page.module.css`, converting kebab-case classes to camelCase for modular React application and dropping globally scoped classes where applicable.
- Formatted `LaserSpyClient.tsx` using `next/image` to optimize imagery, `next/link` for native routing, and ported `_old/js/laser-spy.js` over to React Hooks (`useState`, `useEffect`, `useRef`) for features like the video modal lightbox, ROI Calculator, and dynamic process steps interface.
- Embedded the shared `ContactForm` component reliably at the bottom of the layout structure and confirmed that the build process finished error-free.


### Session 5 — Laser Tag Product Page Migration
- Migrated the Laser Tag product page to `app/products/laser-tag/page.tsx` as a Server Component, appending proper SEO metadata and JSON-LD structured schema (`Product` and `BreadcrumbList`).
- Processed `_old/css/laser-tag.css` into a Next.js `page.module.css`, converting kebab-case classes to camelCase for modular React application and dropping globally scoped classes where applicable.
- Formatted `LaserTagClient.tsx` using `next/image` to optimize imagery, `next/link` for native routing, and ported `_old/js/laser-tag.js` over to React Hooks (`useState`, `useEffect`, `useRef`) for features like the video modal lightbox and dynamic process steps interface.
- Embedded the shared `ContactForm` component reliably at the bottom of the layout structure and confirmed that the build process finished error-free.


### Session 4 — HyperGrid Product Page Migration
- Migrated the HyperGrid product page to `app/products/hyper-grid/page.tsx` as a Server Component, adding required SEO Next.js metadata and JSON-LD structured data (`Product` and `BreadcrumbList` schemas).
- Converted the legacy `_old/css/hyper-grid.css` file into a Next.js CSS Module (`page.module.css`), structurally preserving styles while refactoring global class names into standard scoped camelCase definitions.
- Authored a dynamic React Client Component (`HyperGridClient.tsx`) to manage localized interactive states, seamlessly porting logic for the video lightbox, active game mode previews, and step-based instruction slides.
- Reimplemented the complex ROI Calculator leveraging `next/script` for lazy-loading `Chart.js`, enabling reactive user input ranges, responsive UI formatting, and real-time updates for data tables and charts.
- Optimized routing and assets by resolving external node-module dependencies (`gray-matter`), integrating Next.js components (`next/link`, `next/image`), and successfully embedding the shared reusable `<ContactForm />`.


### Session 3 — About Page + Shared Infrastructure

- Fixed pre-existing build error by adding a placeholder `app/nav/[slug]/page.tsx`; created `app/api/blog/route.ts` that reads `content/blog/*.md` files with gray-matter and returns sorted posts (returns empty array gracefully when the directory doesn't exist yet).
- Extracted the Get In Touch form into a reusable `components/ContactForm.tsx` (`'use client'`) with its own `components/contact-form.module.css` — includes the country searchable combobox, floating labels, auto-grow textarea, all form state, and POST to `/api/contact` with loading/success/error button states; used by About and will be used by Home and Contact pages.
- Created `app/about/about.module.css` — full port of `_old/css/about.css` to CSS Module conventions, covering all six sections: Hero (dark full-bleed with dot-grid overlay), Awards grid, What Drives Us cards, alternating Timeline (dot + line on desktop), Team avatars, and responsive breakpoints at 1100 px / 640 px.
- Created `app/about/AboutClient.tsx` (`'use client'`) rendering all five content sections (Hero → Awards → What Drives Us → Timeline → Team) with inline `data-reveal` attributes for scroll animation and the shared `<ContactForm />` at the bottom; hardcoded data arrays keep the component self-contained with no external fetch needed.
- Created `app/about/page.tsx` as a Server Component exporting `metadata` (SEO title/description, openGraph, canonical) and injecting a `@graph` JSON-LD block with both `BreadcrumbList` (Home → About) and `AboutPage` schema; exactly one H1 in the page (`heroTitle`), all section headings are H2, card sub-headings are H3.
- **Remaining for next session:** write `app/HomeClient.tsx` (Three.js hero, FOG text, logo strip, count-up stats, sticky product stack, Moments AI Break, testimonials carousel, amCharts globe, blog cards) and update the thin `app/page.tsx` server wrapper with metadata + Organization JSON-LD.

### Session 2 — Home Page CSS Module

- Audited all source files for the home page migration: `_old/index.html`, `_old/css/style.css`, `_old/js/main.js`, `_old/js/hero.js`, `_old/js/globe.js`, and `_old/js/fog-text.js` to understand every section, animation, and interaction.
- Copied all static assets from `_old/images/` and `_old/uploads/` into `public/images/` and `public/uploads/` so Next.js `next/image` can serve them.
- Created `app/home.module.css` — a full port of every home-page-specific rule from `_old/css/style.css`, converted to CSS Module conventions (camelCase class names, dynamic state classes like `.scatter`, `.glitch`, `.mbActivated`, `.visible` scoped within the module, compound selectors preserved).
- Established migration architecture: `app/page.tsx` will be a Server Component (metadata + JSON-LD), delegating all interactive content to a `'use client'` `HomeClient.tsx` — required because Next.js cannot export `metadata` from a Client Component.
- **Remaining for next session:** write `app/HomeClient.tsx` (Three.js hero, FOG text animation, logo strip marquee, count-up stats, sticky product stack, Moments AI Break, testimonials carousel, amCharts globe, blog card fetch, contact form with country combobox) and the thin `app/page.tsx` wrapper.

### Session 1 — Shared Layout Foundation
- Copied custom fonts (`ClashDisplay-Semibold.otf`, `GoogleSans` variable font) to `public/fonts/` and rewrote `app/globals.css` with all global tokens: `@font-face` declarations (including Expansiva base64), CSS custom properties, reset, body defaults, Lenis smooth-scroll hooks, scrollbar hiding, and the `[data-reveal]` scroll-animation system.
- Created `components/Navbar.tsx` as a `'use client'` component with scroll-hide behaviour (hides on scroll down, reappears on scroll up), mobile menu open/close state with body scroll lock, and smooth-scroll to `#get-in-touch` for the CTA — all internal links use `next/link`, logo uses `next/image`.
- Created `components/Footer.tsx` as a server component preserving the exact two-column layout (brand + contact info left, nav + social links right) with `next/link` and `next/image`.
- Replaced the scaffolded `app/layout.tsx` with a clean root layout that imports Navbar and Footer, drops the Geist font wiring, and sets site-wide `Metadata` (title template, description, openGraph).
- Identified pre-existing issue: `app/nav/[slug]/` is an empty directory with no `page.tsx`, causing the Next.js type validator to fail at build time; unrelated to migration work and to be resolved when that route is implemented.