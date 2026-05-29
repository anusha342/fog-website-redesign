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

### Session 11 — Laser Spy Page Redesign (In Progress)

Full content, layout, and flow redesign of `app/products/laser-spy/` based on business/investor audit.
Files in scope: `LaserSpyClient.tsx`, `page.module.css`.
Font rules: all edits must comply with `font-guidelines.md` — ClashDisplay UPPERCASE weight 700 for all headings, GoogleSans sentence case for all body/UI, border-radius 0px everywhere.

#### Critical bugs to fix first (before any section work)
- Hero video source is `/videos/hypergrid-bg-video.mp4` — wrong product video. Change to `clip1.mp4` as temp until a dedicated `laserspy-bg-video.mp4` is provided.
- Video modal source is `/videos/clip1.mp4` — verify file exists before pointing to it; use a real gameplay clip.
- Three commented-out sections (How It Works, Moments, Specs) must be uncommented and rebuilt.
- All 4 STEPS in How It Works currently use the same image `laser-spy-1.jpg` — needs individual images per step.
- Moments checklist has 2 unchecked (empty) items visible on the live page — either fill or remove.
- Quick Stats contradictions: "Max Players: 6" vs Specs "1–4 per session"; "600 sq ft" vs Specs "200–1,200 sq ft" configurable.

#### Section 1 — Hero
- Fix video source → `clip1.mp4` (temp hero loop, poster: `laser-spy-1.png`)
- Change eyebrow: `Laser Beam Maze Attraction` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
- Keep H1: `LASER SPY` → ClashDisplay `--fs-hero` (6.25rem) / 700 / #ffffff
- Change subheadline to: `Navigate the grid. Beat the clock. Leave a legend.` → GoogleSans `--fs-body-p1` (1.25rem) / 300 / rgba(255,255,255,0.55)
- Add trust micro-line below subheadline: `Installed across 50+ venues in India` → GoogleSans `--fs-body-p4` (0.875rem) / 400 / rgba(255,255,255,0.40)
- Change primary CTA from `Discover →` to `GET A PROPOSAL →` → ClashDisplay 15px / 600 / uppercase / orange fill
- Keep secondary CTA `▶ Watch it live` → GoogleSans 12px / 500 / uppercase / ghost outline
- Fix video modal to use dedicated gameplay reel once asset is available

#### Section 2 — What Is Laser Spy?
- Background: light (#f5f5f3), `data-nav-theme="light"`
- Row 1: full-width image `laser-spy-1.png`, height 55vh, object-fit cover
- Add section eyebrow above H2: `What is Laser Spy?` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
- Change H2 to: `A ROOM THAT PAYS FOR ITSELF` → ClashDisplay `--fs-heading-2` (2.75rem) / 700 / #0a0a0a
- Add prose paragraph: `Laser Spy is a fully automated laser beam maze room that venues install once and operate forever — no staff required inside. Players enter a darkened chamber crisscrossed with precision laser beams, select a theme, and race to complete the grid before the timer runs out. Every session is captured by AI cameras, and every player leaves with a highlight reel they'll share on social media.` → GoogleSans `--fs-body-p2` (1.125rem) / 400 / lh 1.6 / rgba(19,19,19,0.7)
- Replace the 3 plain text cards with business-value cards:
  - Card 1 heading: `ZERO-OPERATOR ROOM` / body: `Once installed, no staff member is required inside. Players check in, pay, and play — autonomously.`
  - Card 2 heading: `PREMIUM TICKET PRICING` / body: `A contained room experience commands ₹150–₹600 per session — 2–4× the per-player revenue of open-floor attractions.`
  - Card 3 heading: `BUILT-IN VIRAL LOOP` / body: `Every run ends with an AI-cut highlight clip. Players share it. Your venue gets organic social reach — at zero cost.`
  - Card heading: ClashDisplay `--fs-heading-4` (1.375rem) / 700 / UPPERCASE / #0a0a0a
  - Card body: GoogleSans `--fs-body-p3` (1rem) / 400 / rgba(19,19,19,0.7)
  - Card border: 1px solid rgba(19,19,19,0.1), no radius

#### Section 3 — Trust Strip (NEW — insert after Section 2)
- Background: dark (#131313), single horizontal row ~80px tall
- Label: `Trusted by venues across India` → GoogleSans 0.875rem / 400 / letter-spacing 2px / rgba(255,255,255,0.35)
- Venue logos (greyscale, opacity 0.5) OR city names fallback: `Delhi · Mumbai · Bengaluru · Pune · Hyderabad` → GoogleSans 0.875rem / 400 / rgba(255,255,255,0.4)
- No heading, no H-tag, no section eyebrow — single line strip only

#### Section 4 — Themes
- Background: dark (#0f0f0f), `data-nav-theme="dark"`
- Add section eyebrow: `Challenge environments` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
- Change H2 from `Themes` to: `4 WORLDS. ONE MISSION.` → ClashDisplay `--fs-heading-2` (2.75rem) / 700 / #ffffff
- Add subtitle per theme to MODES array (shown on active item only, 200ms fade):
  - Laser Wars: `Squads vs the clock in a battle-zone beam layout`
  - Laser Ship: `Navigate a nautical grid — precision over speed`
  - Laser Lab: `Scientific chaos — the densest beam configuration`
  - Laser Spy: `The classic infiltration mission. The hardest route.`
  - Subtitle: GoogleSans 0.875rem / 400 / rgba(255,255,255,0.5)
- Add footnote below the mode list: `More themes added regularly with software updates — no hardware changes required.` → GoogleSans 0.875rem / 400 / rgba(255,255,255,0.4)
- Theme names: ClashDisplay `--fs-heading-3` (2.25rem) / 700 / active #ffffff / inactive rgba(255,255,255,0.28)
- Theme numbers: GoogleSans 0.875rem / 400 / rgba(255,255,255,0.3)

#### Section 5 — Quick Stats
- Background: #0a0a0a with 2px orange top border
- Fix stat 2: change `Max Players: 6` → `Players per session: 4`
- Fix stat 3: change `Area Required: 600 sq ft` → `Configurable sq ft: 200–1,200`
- Fix stat 1: change `Minimum Age: 6` → `6+` (add plus sign — it's a minimum not fixed)
- Stat number: ClashDisplay `--fs-heading-1` (5rem) / 700 / #ffffff
- Stat label: GoogleSans `--fs-body-p4` (0.875rem) / 400 / uppercase / letter-spacing 2px / rgba(255,255,255,0.4)

#### Section 6 — How It Works (currently commented out — uncomment + rebuild)
- Background: dark, full-bleed `laser-spy-1.png` as photo canvas (same pattern as HyperGrid processCanvas)
- `data-nav-theme="dark"`
- Header strip above canvas:
  - H2: `ENTER. NAVIGATE. CONQUER.` → ClashDisplay `--fs-heading-2` / 700 / #ffffff
  - Sub: `Zero staff inside. Every session runs itself.` → GoogleSans `--fs-body-p2` / 300 / rgba(255,255,255,0.55)
- 4 step cards overlaid at corners of photo canvas (same animated layout as HyperGrid How It Works):
  - Step 01 `TAP & PAY`: `Tap your card or token at the kiosk. Select your theme. Payment and game selection — done in under 30 seconds.`
  - Step 02 `ENTER THE CHAMBER`: `The room opens. AI cameras activate. Your 10-second study window begins — map the beams before the clock starts.`
  - Step 03 `NAVIGATE THE GRID`: `Move through the laser field. Every broken beam adds a penalty. Your final time posts live to the leaderboard.`
  - Step 04 `CLAIM YOUR MOMENT`: `Scan the QR at the exit. Your AI highlight reel — every near-miss, every perfect move — is ready to share in seconds.`
  - Step label: GoogleSans `--fs-body-p4` / 500 / uppercase / letter-spacing 4px / orange
  - Step title: ClashDisplay `--fs-heading-4` / 700 / UPPERCASE / #ffffff
  - Step desc: GoogleSans `--fs-body-p3` / 400 / lh 1.5 / rgba(255,255,255,0.6)
- Keep "Click to Play" animated trigger button from HyperGrid

#### Section 7 — Why Laser Spy / Operator Differentiators (NEW — insert after How It Works)
- Background: light (#f5f5f5), `data-nav-theme="light"`
- Layout: left-right split. Left: heading + body. Right: comparison table.
- Eyebrow: `Built for operators` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
- H2: `NOT AN ESCAPE ROOM. NOT LASER TAG.` → ClashDisplay `--fs-heading-2` / 700 / #0a0a0a
- Body: `Laser Spy is a new category — a timed precision challenge that resets in seconds, requires no actors, no puzzles to reset, and no staff inside the room. It runs 12–16 hours a day on its own.` → GoogleSans `--fs-body-p2` / 400 / rgba(19,19,19,0.7)
- Comparison table (right column) — Laser Spy vs Escape Room vs Laser Tag:
  - Reset time: `< 30 seconds` vs `15–30 minutes` vs `5–10 minutes`
  - Staff per session: `0` vs `1–2` vs `1–2`
  - Sessions per hour: `4–6` vs `1` vs `3–4`
  - Replay drive: `Leaderboard + time-beat` vs `Once per puzzle` vs `Moderate`
  - AI content output: `Yes — per session` vs `No` vs `Rare`
  - Column headers: GoogleSans 0.875rem / 500 / uppercase / letter-spacing 2px / rgba(19,19,19,0.4)
  - Laser Spy values: GoogleSans `--fs-body-p3` / 400 / #0a0a0a (numbers bold)
  - Competitor values: GoogleSans `--fs-body-p3` / 400 / rgba(19,19,19,0.45)
  - FOG column has 2px orange left border

#### Section 8 — Moments AI (currently commented out — uncomment + fix)
- Background: dark (#0f0f0f), `data-nav-theme="dark"`
- Add header above bento:
  - Eyebrow: `Moments AI` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
  - H2: `YOUR VENUE'S BEST MARKETING TOOL` → ClashDisplay `--fs-heading-2` / 700 / #ffffff
  - Sub: `Every run auto-captures an AI-edited highlight clip. Players share it. Your venue gets reach — for free.` → GoogleSans `--fs-body-p2` / 300 / rgba(255,255,255,0.55)
- Fix all checklist items to checked (no empty/pending boxes on live page):
  - ✅ Enter the challenge room
  - ✅ Select challenge mode at kiosk
  - ✅ AI capture starts automatically
  - ✅ Highlight clip ready at exit QR
  - ✅ Score synced to leaderboard
- Card heading: ClashDisplay `--fs-heading-3` / 600 (momentsCardH exception) / UPPERCASE / #ffffff or #0a0a0a
- Badge: GoogleSans 0.875rem / 500 / uppercase / orange

#### Section 9 — Specifications (currently commented out — uncomment + expand)
- Background: dark (#131313), `data-nav-theme="dark"`
- H2: `SPECIFICATIONS` → ClashDisplay `--fs-heading-2` / 700 / #ffffff
- Sub: `Configurable from 200 to 1,200 sq ft. FOG handles full room design and installation.` → GoogleSans `--fs-body-p2` / 400 / rgba(255,255,255,0.55)
- Room diagram image: `sample.jpg` as placeholder — flag client that a proper 3D floor plan / isometric render is needed
- Image caption: `Standard configuration shown: 600 sq ft · 40 beams · 4-player layout` → GoogleSans `--fs-body-p4` / 400 / rgba(255,255,255,0.4)
- 4 spec cards in a 2×2 grid:
  - `ROOM SIZE`: `200–1,200 sq ft · approx. 50 sq ft per player · FOG designs the layout to your space`
  - `LASER BEAMS`: `20–120 individually addressable beams · 5 preset difficulty levels + fully custom configuration`
  - `SESSION`: `3–8 min operator-set · resets in under 30 seconds between groups · 4–6 sessions per hour`
  - `SAFETY & POWER`: `Class 1 eye-safe lasers · Instant emergency stop · Avg 1.5 KW · Audio alarm + red flash on breach`
  - Card title: ClashDisplay `--fs-heading-4` / 700 / UPPERCASE / #ffffff
  - Card body: GoogleSans `--fs-body-p3` / 400 / lh 1.5 / rgba(255,255,255,0.6)
  - Card border: 1px solid rgba(255,255,255,0.08), no radius
- Info row below cards (3 items separated by · dividers):
  - `Installation in 7–14 days depending on room size`
  - `2-year hardware warranty · software updates included`
  - `Dedicated FOG support line · remote diagnostics available`
  - Typography: GoogleSans `--fs-body-p4` / 400 / rgba(255,255,255,0.5)

#### Section 10 — ROI Calculator
- Background: light (#f5f5f5), `data-nav-theme="light"`
- Add eyebrow above H2: `Revenue modelling` → GoogleSans 0.875rem / 500 / uppercase / letter-spacing 4px / orange
- Change H2 from `Revenue Projection` to: `YOUR RETURNS, CALCULATED` → ClashDisplay `--fs-heading-2` / 700 / #0a0a0a
- Add sub below H2: `Based on real data from FOG-installed venues. Adjust to match your location.` → GoogleSans `--fs-body-p3` / 400 / rgba(19,19,19,0.6)
- Fix default floor value: 300 → **600** sq ft (matches stated product spec)
- Fix default ticket price: ₹200 → **₹300**
- KPI color differentiation (currently all same color):
  - Investment: #0a0a0a (neutral)
  - Monthly Revenue: orange
  - Payback Period: orange
  - 5-Year ROI: green (#1a7a2e) — hero KPI
- KPI label: GoogleSans `--fs-body-p4` / 400 / uppercase / letter-spacing 2px / rgba(19,19,19,0.45)
- KPI value: ClashDisplay `--fs-heading-2` (2.75rem) / 700
- Change disclaimer text: `Indicative estimates based on data from FOG-installed venues. Actual results vary by location, marketing, and operations.`
- Change primary CTA to: `GET A DETAILED PROPOSAL →` → ClashDisplay 15px / 600 / uppercase / orange fill
- Add secondary CTA: `Book a site visit` → GoogleSans 12px / 500 / uppercase / ghost outline

#### Section 11 — FAQ (NEW — insert before Testimonials)
- Background: light (#ffffff), `data-nav-theme="light"`
- H2: `COMMON QUESTIONS` → ClashDisplay `--fs-heading-2` / 700 / #0a0a0a
- Layout: accordion — 2-column on desktop (heading left, items right), 1-column on mobile
- 6 questions:
  1. `What is the minimum room size for Laser Spy?` → `200 sq ft is the minimum, though we recommend 400–600 sq ft for the best player experience. FOG designs the beam layout for your exact space — no space is wasted.`
  2. `Is the laser safe? Can children play?` → `Yes. All beams are Class 1 eye-safe infrared lasers — the same category used in TV remotes. Laser Spy is approved for ages 6 and above. Emergency stop buttons are installed at all exit points.`
  3. `How long does installation take?` → `Typically 7 to 14 days depending on room size and whether the space is already prepared. FOG handles design, installation, and staff training end-to-end.`
  4. `Does it need an operator inside the room?` → `No. The room is fully automated. Players interact with a kiosk at the entrance — payment, game selection, and session launch all happen without staff involvement. You may assign one person to manage the queue externally.`
  5. `How many sessions can I run per day?` → `With a 5-minute session and a 30-second reset, you can run 10–11 sessions per hour. At 12 operating hours, that's 120+ sessions daily per room.`
  6. `What happens when a beam component fails?` → `The software flags the fault automatically and suspends sessions for that beam. FOG's remote diagnostics team is alerted. Field-replaceable beam units mean most issues are resolved without an engineer visit.`
- Question: GoogleSans `--fs-body-p2` (1.125rem) / 400 / #0a0a0a
- Answer: GoogleSans `--fs-body-p3` (1rem) / 400 / lh 1.5 / rgba(19,19,19,0.65)
- Expand icon: `+` / `–` in GoogleSans 20px / orange
- Divider: 1px solid rgba(19,19,19,0.1)

#### Section 12 — Testimonials
- Keep existing `TestimonialsCarousel` component — no structural changes
- Background: dark (#0f0f0f), `data-nav-theme="dark"`
- Flag to client: add at least one Laser Spy-specific testimonial with venue name, city, and ROI outcome

#### Section 13 — Contact / Get In Touch
- Keep existing `ContactForm` with `defaultProduct="lasermaze"`
- Add above the form:
  - H2: `READY TO INSTALL?` → ClashDisplay `--fs-heading-2` / 700 / #ffffff
  - Sub: `Tell us about your venue. We'll design a room that fits your space, your budget, and your footfall — and have you earning in 7 days.` → GoogleSans `--fs-body-p2` / 300 / rgba(255,255,255,0.55)

#### Assets needed from client before full build
- `public/videos/laserspy-bg-video.mp4` — dedicated hero background loop (P0)
- `public/images/laser-spy/laser-spy-2.jpg` through `laser-spy-5.jpg` — per-step images for How It Works (P0)
- Laser Spy room floorplan / isometric render — Specs section diagram (P1)
- Venue / client logos (4–6) — Trust strip (P1)
- `laser-spy-3d-model.png` — Specs header visual equivalent to HyperGrid specs-1.png (P1)
- Testimonial text with real venue name + city — Testimonials (P1)

---

### Session 1 — Shared Layout Foundation
- Copied custom fonts (`ClashDisplay-Semibold.otf`, `GoogleSans` variable font) to `public/fonts/` and rewrote `app/globals.css` with all global tokens: `@font-face` declarations (including Expansiva base64), CSS custom properties, reset, body defaults, Lenis smooth-scroll hooks, scrollbar hiding, and the `[data-reveal]` scroll-animation system.
- Created `components/Navbar.tsx` as a `'use client'` component with scroll-hide behaviour (hides on scroll down, reappears on scroll up), mobile menu open/close state with body scroll lock, and smooth-scroll to `#get-in-touch` for the CTA — all internal links use `next/link`, logo uses `next/image`.
- Created `components/Footer.tsx` as a server component preserving the exact two-column layout (brand + contact info left, nav + social links right) with `next/link` and `next/image`.
- Replaced the scaffolded `app/layout.tsx` with a clean root layout that imports Navbar and Footer, drops the Geist font wiring, and sets site-wide `Metadata` (title template, description, openGraph).
- Identified pre-existing issue: `app/nav/[slug]/` is an empty directory with no `page.tsx`, causing the Next.js type validator to fail at build time; unrelated to migration work and to be resolved when that route is implemented.

---

## Laser Spy Page — Section Status Tracker

> Updated each session. Statuses: `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked (needs asset/info from client)

### Pre-work (bugs — fix before section work)
- `[ ]` Fix hero video source (currently plays HyperGrid video) → change to `clip1.mp4`
- `[ ]` Fix video modal source → verify `clip1.mp4` exists and plays correctly
- `[ ]` Fix all 4 How It Works steps using the same image → needs individual step images from client
- `[ ]` Fix Moments checklist empty boxes → all items marked done or removed
- `[ ]` Fix Quick Stats contradiction — Max Players 6 vs Specs 4 → change to `4`
- `[ ]` Fix Quick Stats contradiction — 600 sq ft vs configurable 200–1,200 → change label + value

### Sections
| # | Section | Type | Status | Notes |
|---|---|---|---|---|
| 1 | Hero | Edit existing | `[ ]` | Fix video, CTA text, add trust line, fix modal |
| 2 | What Is Laser Spy? | Rewrite existing | `[ ]` | Add prose, replace cards with business-value cards |
| 3 | Trust Strip | New | `[!]` | Blocked — needs venue logos or permission to use city names |
| 4 | Themes | Minor edit | `[ ]` | Add eyebrow, new H2, per-theme subtitles, footnote |
| 5 | Quick Stats | Fix existing | `[ ]` | Fix 2 contradictory numbers, add orange top border |
| 6 | How It Works | Uncomment + rebuild | `[!]` | Blocked — needs individual step images from client |
| 7 | Why Laser Spy (Differentiators) | New | `[ ]` | No asset dependency — pure content + comparison table |
| 8 | Moments AI | Uncomment + fix | `[ ]` | Fix checklist, add header, reframe as operator benefit |
| 9 | Specifications | Uncomment + expand | `[!]` | Partially blocked — needs room render/floorplan image |
| 10 | ROI Calculator | Edit existing | `[ ]` | Fix defaults, add eyebrow/sub, fix KPI colors, add CTAs |
| 11 | FAQ | New | `[ ]` | No asset dependency — pure content, accordion UI |
| 12 | Testimonials | Keep existing | `[!]` | Blocked — needs Laser Spy-specific testimonial from client |
| 13 | Contact / Get In Touch | Minor edit | `[ ]` | Add H2 + sub above existing form |

### Assets outstanding from client
| Asset | Used In | Priority | Status |
|---|---|---|---|
| `laserspy-bg-video.mp4` | Hero background loop | P0 | `[!]` Pending |
| `laser-spy-2.jpg` → `laser-spy-5.jpg` | How It Works step images | P0 | `[!]` Pending |
| Room floorplan / isometric render | Specs section diagram | P1 | `[!]` Pending |
| Venue / client logos (4–6) | Trust strip | P1 | `[!]` Pending |
| `laser-spy-3d-model.png` | Specs header visual | P1 | `[!]` Pending |
| Laser Spy testimonial with venue + city | Testimonials | P1 | `[!]` Pending |