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

## Pending

- **Post-submit animation (`#get-in-touch`)**: After the user clicks "Send Message" and the API returns success, trigger a section-level animation (design TBD) that reassures the visitor FOG will be in touch. The hook is already in `components/ContactForm.tsx` — `status === 'success'` drives it. Implementation needs a `.submitted` CSS Module class + keyframes in `components/contact-form.module.css`.

- **Admin panel — Google OAuth login**: The current admin login uses email allowlist + OTP via Resend. Replace or supplement with Google OAuth (`next-auth` or similar) so admins can sign in with their Google account instead of waiting for an OTP email. Track in `pipeline.md`.

- **Admin panel — Testimonials CRUD**: The Testimonials card on the admin dashboard is currently greyed out. Implement full create/edit/delete for testimonials (stored as `testimonials/{slug}.json` in S3), following the same pattern as the blog pipeline.

## Progress Log

### Session 10 — Project-Wide SEO Finalization

- Created `app/sitemap.ts` (dynamic sitemap including all blog posts) and `app/robots.ts` (crawler instructions) to maximize search engine discovery.
- Created `public/llms.txt` — a structured plain-text resource for AI models and search engines describing FOG Technologies and its core products.
- Audited all pages for SEO compliance: verified exactly one H1 per page, added `.sr-only` utility for visually hidden hero headings, and confirmed unique canonical links.
- Image SEO: Refactored home page blog cards to use `next/image` with descriptive alt text and updated `next.config.ts` to whitelist external product render domains.
- Social Metadata: Standardized OpenGraph exports across all pages, adding high-quality preview images, dimensions, and descriptive alt text for better social sharing.

### Session 9 — Contact Page Migration & API

- Created `app/contact/page.tsx` — Server Component with full SEO metadata and JSON-LD (`BreadcrumbList`, `ContactPage`) schema; renders Hero, Info Strip, and Contact Form.
- Created `app/contact/ContactClient.tsx` — 'use client' component porting the legacy layout and form logic; features a searchable country combobox, floating labels, auto-growing textarea, and scroll-reveal animations.
- Created `app/contact/contact.module.css` — Comprehensive CSS Module porting legacy styles from `contact.css` and `style.css` with full responsive support (900px/640px breakpoints).
- Created `app/api/contact/route.ts` — Resend-powered API route with server-side validation, error handling, and professional HTML email templates for admin notifications.
- Infrastructure: Installed `resend` dependency and refactored API instantiation to ensure build-time stability without environment variables.

### Session 8 — Blog System + Testimonials Infrastructure

- Created `content/blog/the-roi-case-for-led-gaming-floors.md` — sample post with full frontmatter (title, date, excerpt, author, coverImage, category, tags, readTime) and ~600-word body in proper Markdown.
- Created `content/testimonials/rajiv-mehta.md` and `sarah-chen.md` — sample testimonial files with frontmatter (name, company, designation, rating, avatar, logo, product, location) and body text.
- Created `lib/blog.ts` — exports `getAllPosts()` (sorted by date desc), `getPostBySlug(slug)` (returns full content + HTML), and `markdownToHtml()` (zero-dependency regex-based converter handles h2/h3, bold/italic, lists, blockquotes, inline code, links, images, paragraphs, HR).
- Created `lib/testimonials.ts` — exports `getAllTestimonials()` reading `content/testimonials/*.md`.
- Updated `app/api/blog/route.ts` — now delegates to `getAllPosts()` from lib/blog.ts; returns a flat JSON array (not `{ posts: [...] }`) so `HomeClient.tsx` can consume it directly.
- Created `app/blog/page.tsx` — Server Component blog listing: dark hero strip + 3-column card grid (cover image via `next/image`, category, title, excerpt, author, date, readTime). Full `metadata` export + Blog/BreadcrumbList JSON-LD.
- Created `app/blog/page.module.css` — card grid layout (3→2→1 col responsive), hover effects matching site design language.
- Created `app/blog/[slug]/page.tsx` — Server Component post page: `generateStaticParams` pre-renders all posts at build time; `generateMetadata` pulls per-post SEO from frontmatter; sidebar lists all posts as nav tabs (active post highlighted); prose rendered via `dangerouslySetInnerHTML` from `markdownToHtml()`; `BlogPosting` JSON-LD schema.
- Created `app/blog/[slug]/page.module.css` — sidebar+content 2-column layout, full prose styles (h2/h3, blockquote, code, lists), responsive (stacks to horizontal scroll tabs on mobile).
- Created `components/TestimonialCard.tsx` — reusable `<figure>` component accepting a `Testimonial` from lib; renders stars, quote mark, body, divider, avatar (next/image), name, role, product tag.
- Created `components/testimonial-card.module.css` — card styles with accent top-border hover, star ratings, author avatar.
- Build: **clean**, `/blog` static, `/blog/[slug]` SSG (pre-rendered for each .md file).


### Session 7 — Home Page Migration

- Rewrote `app/page.tsx` as a Server Component exporting `metadata` (title, description, openGraph, canonical) and injecting a `@graph` JSON-LD block with `Organization`, `WebSite`, and `BreadcrumbList` schemas.
- Created `app/HomeClient.tsx` as a `'use client'` component rendering all home page sections:
  - **Hero**: Three.js scene (hex grid, orb structure, particle field, speed streaks, scan beam, camera parallax) loaded dynamically via `loadScript` utility.
  - **FOG text**: hover-to-reveal animation (`FOG` → `FUTURE OF GAMING`) fully ported from `fog-text.js` using `useState` + `useEffect` with `scatter`/`glitch` CSS Module state classes.
  - **Logo strip**: static marquee with 4× duplicated logos, CSS-driven infinite scroll (no JS).
  - **About & Numbers**: `IntersectionObserver`-driven count-up animation for 10K/70%/10+ stats, card fade-in with CSS transition.
  - **Products sticky stack**: 5 sections (`HyperGrid`, `Laser Tag`, `Laser Spy`, `Moments AI Break`, `Moments`) with thumbnail click swap + 6-second auto-advance, `mbActivated` class triggered by `IntersectionObserver`.
  - **Testimonials carousel**: 3 hardcoded entries, 4-second auto-advance with `exiting`/`entering`/`visible` CSS transition states, prev/next arrows.
  - **Globe**: amCharts 5 orthographic globe loaded sequentially (am5 → map → geodata → Animated), auto-rotation, pulse dots for 10 cities, pause on hover.
  - **Blog cards**: fetches from `/api/blog`; renders up to 3 cards, empty state is silent.
  - **Contact form**: reuses shared `<ContactForm />` component.
- Build passes with zero TypeScript errors and zero warnings (only expected `metadataBase` advisory).


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