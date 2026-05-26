# UI/UX Brief — FOG Technologies Website

## Your Role
You are a senior UI/UX designer with 10+ years of experience whose work is recognised worldwide. You design for premium B2B brands. Every decision you make — spacing, motion, typography weight, hover behaviour — reflects that seniority. You never ship mediocre interactions. You think in systems, not one-off fixes.

---

## Client's Definition of Premium

The following criteria define what "premium" means on this website. Every UI decision must serve at least one of these:

**Smooth Inertial Scrolling**
The page has physical weight. Scrolling feels buttery and luxurious — like real-world momentum, not a browser default.

**Animation of Elements While Scrolling**
Content reveals itself as the user scrolls. Elements don't just appear — they choreograph in, with purpose and stagger.

**Unique Photo Placement**
Images are placed in collage layouts, with overlap, rotation, and editorial framing. Never a plain grid of equal boxes.

**Hovering Elements with Smooth Animation**
Every interactive element responds to hover with a smooth, considered animation. Nothing snaps — everything glides.

**Clean Design with Minimal Text**
Whitespace is a design element. Text is ruthlessly edited. The visual hierarchy communicates before a single word is read.

**Font and Theme Consistency**
One type scale. One spacing system. One motion language. No page looks like it was built separately.

**Futuristic and High-Tech Landing Page**
The hero must feel cutting-edge — like the brand lives three years ahead of everyone else.

**Seamless Navigation**
Menus are intuitive. Important sections are surfaced. The user never wonders where to click.

**Subtle Motion and Micro-interactions**
Hover effects, scroll animations, and transitions are tasteful — never loud. Every interaction feels purposeful.

**Micro-Copy Writing**
Buttons, labels, error states, and CTAs carry brand personality. Clever, brief, memorable.

**Invisible UX**
The interface is so intuitive that the user is never conscious of it. They just move through the experience.

**Immersive Video**
Cinematic, full-screen background loops capture attention instantly. Video is used to communicate mood, not just information.

---

## Target Audience
B2B — venue operators, investors, and entertainment business owners evaluating a high-ticket purchase. They are professional, discerning, and time-poor. The design must build trust and communicate capability in seconds.

---

## Non-Negotiables
- Every animation must respect `prefers-reduced-motion`
- Dark-first, tech-forward aesthetic — never playful or consumer-casual
- Color palette, fonts, and theme must stay consistent (defined in `design-CLAUDE.md`)

---

## Working Methodology

Work is done **section by section, page by page** in this order:

1. Product pages (HyperGrid → Laser Tag → Laser Spy) — section by section 
2. About page — section by section
3. Contact page — section by section
4. Blog listing + Blog post — section by section
5. Home page — section by section top to bottom

**After every section is completed**, a summary of what was changed is appended to the `## Session Log` section at the bottom of this file. This log is the source of truth for what has been done and what design decisions were made, so the next session can maintain visual consistency.

---

## HyperGrid Product Page — Section Map

| # | Section | Status |
|---|---|---|
| 1 | Hero (cinematic video BG `/videos/hypergrid-bg-video.mp4`, HUD brackets, eyebrow, title, sub-headline, CTAs, scroll indicator) | Done |
| 2 | What is HyperGrid (full-width 3D render + 3 descriptor cards) | Done |
| 3 | Game Modes (sticky image panel + interactive modes list) | Done |
| 4 | Moments Bento Grid (mixed card layout) | Done |
| 5 | How It Works (process steps carousel with image swap) | Done |
| 6 | ROI Calculator (slider inputs + Chart.js output) | Done |
| 7 | Specifications (3D model + dimension + tech spec cards) | Done |
| 8 | Testimonials Carousel (auto-advance, phase-based animations) | Done |
| 9 | Get In Touch (shared ContactForm, product pre-selected) | Done |

---

## About Page — Section Map

| # | Section | Status |
|---|---|---|
| 1 | Hero (dark full-bleed, dot-grid overlay, H1 title, desc paragraph, "Our Journey" CTA, scroll indicator) | Done |
| 2 | Awards & Honours (6-card grid — year badge, icon, award name, org, description) | Done |
| 3 | What Drives Us (4 value cards — Innovation, Reliability, Speed, Partnership — icon + title + body) | Done |
| 4 | The FOG Journey (alternating left/right timeline — dot, line, year badge, title, desc) | Done |
| 5 | The Team Behind FOG (4 avatar initials cards — name + role) | Done |
| 6 | Get In Touch (shared ContactForm) | Done |

---

## Laser Tag Product Page — Section Map

| # | Section | Status |
|---|---|---|
| 1 | Hero (cinematic video BG, HUD corners, reticle crosshair, eyebrow, title, CTAs, QR widget, scroll indicator) | Done |
| 2 | Why FOG's Laser Tag (USP cards — key differentiators that make FOG's product the premium choice) | Done |
| 3 | Gun + Vest Description (equipment deep-dive — gun specs + vest specs, side-by-side or feature breakdown) | Done |
| 4 | Game Modes (60/40 image+list grid, Watch Gameplay overlay button) | Done |
| 5 | Moments in Laser Tag (step-flow bento grid — 4 cards with step labels and editorial cascade) | Done |
| 6 | Arena Design (full-width arena render + area copy) | Done |
| 7 | Arena Specs (dimensions card + 2 info cards — Game Modes, Equipment) | Done |
| 8 | Operator (operator-focused section — ease of management, controls, reporting) | Pending |
| 9 | Get In Touch (shared ContactForm, lasertag pre-selected) | Pending |

---

## Home Page — Section Map

| # | Section | Status |
|---|---|---|
| 1 | Hero (Three.js canvas, FOG text, CTA buttons, scroll indicator) | Pending |
| 2 | Logo Strip (marquee) | Pending |
| 3 | About & Numbers (stats cards) | Pending |
| 4 | Products Sticky Stack (5 product sections) | Pending |
| 5 | Testimonials Carousel | Done |
| 6 | Globe | Pending |
| 7 | Blog Cards | Pending |
| 8 | Get In Touch (contact form) | Done |

---

## Session Log

> Entries are appended here after each section is completed. Most recent entry is at the top.

### Blog Listing Page — Client-Side Search Fix
- **Root cause:** Server-side `searchParams` filter was returning 0 results when query string was present (field mismatch with S3 post data), leaving the posts column visually empty while the sidebar remained populated
- **Fix:** Extracted posts list + search + tag pills into `BlogListingClient.tsx` (`'use client'`) — server component fetches all posts once, passes them as props; client component filters with `useMemo` in real-time, never navigating away or reloading the page
- **Tag pills changed from `<Link>` to `<button>`** — toggle active tag state; clicking the same tag again clears the filter; mutually exclusive with text search (typing clears active tag, clicking tag clears query)
- **Search input is controlled** (`useState`) — filters title + excerpt + category with `toLowerCase().includes()` on every keystroke
- **Empty state messaging:** When filtered → `"No posts match 'query'."` vs no posts at all → `"No posts yet — check back soon."`
- **No URL navigation on search** — preserves scroll position and avoids full page reload
- **Search icon** changed from `<button type="submit">` to a decorative `<span>` (pointer-events: none) — no longer needs a form submit since filtering is real-time

### Blog Listing Page — Two-Column Layout Redesign
- **Layout:** Replaced 3-column card grid with `grid-template-columns: 1fr 340px` — posts column left, sticky sidebar right; collapses to single column at ≤1023px
- **Section bg:** `#ffffff` white throughout (section, header, cards) — removed dark hero strip; `margin-top: 60px` retained for navbar clearance
- **Section header:** Centered `blogEyebrow` ("Insights & Updates") — GoogleSans 500, `var(--accent)` orange, 4px tracking, clamp(10px,1vw,13px); `blogTitle` ("News & Blogs") — ClashDisplay 700, clamp(28px,4vw,56px), uppercase, `#0a0a0a`, `-0.5px` tracking — matches universal H1 spec
- **Post card:** `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 12px`; hover `translateY(-4px)` spring + `box-shadow: 0 14px 44px rgba(0,0,0,0.09)`; image `aspect-ratio: 16/9` with hover `scale(1.04)`
- **Tag + date row:** Sits below image, above title — `postCategory` (dark bg pill, uppercase, 11px, `rgba(0,0,0,0.07)` bg) + `postDate` (border pill, `rgba(0,0,0,0.45)`) — matches reference image eyebrow placement
- **"Read More" link:** GoogleSans 500, 12px, 2px tracking, orange — underline draw animation via `::after` on card hover
- **Sidebar (sticky, `top: 100px`):** 4 widgets stacked with `gap: 36px`
  - **Search:** `<form action="/blog" method="GET">` — text input with `background: #f5f5f5`, `border-radius: 8px`; focus → orange border; SVG search icon button right-aligned; server-side `q` param filters posts by title/excerpt/category
  - **Popular Tags:** Unique categories extracted from posts as `<Link>` pills — `border-radius: 100px`, hover fills `var(--accent)` orange; active state if current query matches
  - **Recent Posts:** Last 3 posts — thumbnail (68×60px, `border-radius: 8px`) + title (2-line clamp) + date; whole item fades to `opacity: 0.78` on hover
  - **CTA Banner:** `background: #111111`, `border-radius: 16px`; orange radial glow pseudo-element top-right; eyebrow (orange, 4px tracking) + ClashDisplay title + orange pill CTA button with hover `translateY(-2px)` spring
- **Server-side search:** `searchParams` awaited (Next.js 15 async pattern); filters `allPosts` by `title | excerpt | category` before render
- **Responsive 1023px:** grid collapses to single column; sidebar drops sticky positioning
- **Responsive 639px:** section/header padding tightened; card body padding `20px 20px 24px`

### Laser Tag — Section 1: Hero — HyperGrid layout parity
- **Source of truth:** HyperGrid hero layout — content anchored to lower third, staggered reveal, scroll indicator, spring button transitions; only video source, copy, and thematic accents (cyan reticle) belong to Laser Tag
- **`.hero` justify-content:** `center` → `flex-end` — content now anchors to lower third exactly like HyperGrid; was vertically centred
- **`.heroContent`:** `max-width: 860px` → `900px`; `gap: 28px` → `gap: var(--sp-16)`; added `align-self: flex-end` and `padding-bottom: clamp(64px, 8vh, 120px)` — text block sits at the same lower-third position as HG regardless of viewport height
- **HUD corners:** Added `@keyframes hudDraw` (scale 0.6→1, opacity 0→0.55) with staggered delays 0.4–0.7s and spring cubic-bezier; kept `var(--lt-cyan)` border colour (thematic) vs HG white; added `prefers-reduced-motion` guard
- **Eyebrow added:** `"Multi-Player Laser Combat"` — GoogleSans 500, `var(--hg-neon-orange)`, 4px tracking, `clamp(10px,1.1vw,13px)` — `data-reveal-delay="0"` matches universal section eyebrow spec
- **Sub-headline added:** `"Where strategy meets adrenaline."` — GoogleSans 300, `rgba(255,255,255,0.55)`, `clamp(14px,1.6vw,18px)`, `0.5px` tracking — `data-reveal-delay="0.22"` matches Body Lead spec
- **data-reveal stagger corrected:** eyebrow 0s → title 0.12s → sub 0.22s → buttons 0.32s — was title 0.1s / buttons 0.2s (non-standard)
- **Scroll indicator added:** `heroScroll` (position absolute, bottom 32px, left 50%) + `heroScrollChevron` (18×18px border-right/bottom chevron) + `@keyframes scrollBob` (opacity + 6px Y travel, 2s loop); `prefers-reduced-motion` freezes animation — was missing entirely from LT
- **`.hbtn` transition:** `all 300ms cubic-bezier(.4,0,.2,1)` → explicit property list with spring `cubic-bezier(.34,1.56,.64,1)` for transform; added `.hbtn:hover { transform: translateY(-2px); }` — lift on hover was missing
- **`.hbtnSolid:hover` box-shadow:** `0 0 32px rgba(240,80,35,.55)` → `0 8px 28px rgba(240,80,35,0.45)` — directional lift shadow, lower opacity, matches HG spec
- **`.hbtnGhost:hover`:** added `box-shadow: 0 8px 24px rgba(255,255,255,0.12)` — was missing
- **`.heroBtnWatch`:** added frosted-glass variant (`rgba(255,255,255,0.05)` bg, `blur(8px)`) + `:hover` — was referenced in JSX but had no CSS definition in LT
- **Responsive 767px:** `.heroBtns` now gets `width: 100%; max-width: 280px` to match HG constrained mobile button width; retained `hudCorner/heroQr { display: none }`

### Laser Tag — Sections 6 & 7: Arena Design + Arena Specs Layout Parity with HyperGrid
- **Source of truth:** HyperGrid `speModelSection` + `speDataSection` — exact layout match; only content (arena image, dimension data, Game Modes / Equipment info cards) belongs to Laser Tag
- **`speModelInner` padding:** `80px 0 0` → `72px var(--sp-80) 0` — matches HyperGrid horizontal inset and top rhythm
- **`speModelTitle` margin-bottom:** `20px` → `48px` — proper breathing room between heading and arena image
- **`speDataInner` padding:** `80px 0` → `72px var(--sp-80)` — adds horizontal inset matching inner-wrapper convention
- **`speDataInner` align-items:** `start` → `stretch` — both columns (dims card + info cards) now fill identical height; eliminates unequal card heights at wide viewports
- **`speDimsCard`:** added `height: 100%; display: flex; flex-direction: column;` — flex chain propagates stretch into card
- **`speDimsTable`:** added `flex: 1; justify-content: center;` — rows distribute vertically to fill available card height
- **`speInfoCards`:** added `height: 100%;` — right column fills full stretched height
- **`speInfoCard`:** added `flex: 1; display: flex; flex-direction: column; justify-content: center;` — each info card takes equal share of column, content centred vertically
- **Responsive 1023px:** expanded from single `grid-template-columns: 1fr` override to also set `padding: 56px var(--sp-48)` on `speDataInner` and `padding: 56px var(--sp-48) 0` on `speModelInner` — matches HyperGrid breakpoint handling exactly
- **Responsive 767px:** added `speModelInner { padding: 48px var(--sp-24) 0 }` and `speDataInner { padding: 48px var(--sp-24) }` — was previously missing entirely from LT

### Laser Tag — Global: Section Padding Refactor
- **Rule applied:** All sections in `page.module.css` changed to `padding: 80px 0` — 80px top/bottom, zero left/right. Documented in `design-CLAUDE.md` under "Section Layout".
- **Removed:** All responsive overrides that modified horizontal padding (`36px`, `32px`, `24px`, `20px`, `var(--sp-80)`, `var(--sp-48)`, `var(--sp-24)` horizontal values) across every breakpoint. Top/bottom stays `80px` across all breakpoints.
- **Sections affected:** uspSection, equipSection, modesV2Section, momentsInner, speModelInner, speDataInner, testSection
- **Unchanged:** Hero (full-bleed, `padding: 0`), inner card/component padding (e.g. `uspContent`, `equipOverlay`, `speInfoCard`) — only section-shell and inner-wrapper padding was normalised.

### Laser Tag — Section 3: Gun + Vest Description
- **Section bg:** `#ffffff` (white), `height: 50vh`, `min-height: 380px`, `padding: 80px 0`, `display: flex; align-items: stretch` — natural flex fill to propagate height into grid
- **No section title or eyebrow** — section is purely visual (two cards with no header text above)
- **Inner grid:** max-width 1440px, `display: grid; grid-template-columns: 1fr 1fr; gap: 20px` — fills full available 50vh height via flex stretch chain
- **Card (`.equipCard`):** `border-radius: 16px; overflow: hidden`; `box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 12px 48px rgba(0,0,0,0.08)` — dual-layer depth shadow
- **Image layer (`.equipImgWrap`):** `position: absolute; inset: 0`; `next/image fill + objectFit: cover`; hover `transform: scale(1.06)` with `700ms cubic-bezier(0.34,1.56,0.64,1)` spring
- **Text overlay (`.equipOverlay`):** `position: absolute; inset: 0; background: var(--accent)` (orange); `opacity: 0; transform: translateY(14px)` at rest → `opacity: 1; translateY(0)` on card hover; `transition: opacity 360ms ease, transform 420ms spring` — smooth photo-to-text swap
- **Overlay layout:** `justify-content: flex-end; padding: 36px 40px` — text anchored at card bottom
- **Label (`.equipLabel`):** GoogleSans 500, 11px, 4px tracking, uppercase, `rgba(255,255,255,0.65)` — "Hardware" / "Protection"
- **Card title (`.equipCardTitle`):** ClashDisplay 700, `clamp(22px,3vw,38px)`, uppercase, `#ffffff` — "Combat Phaser" / "Tactical Vest"
- **Feature list (`.equipFeatures`):** `list-style: none; gap: 8px`; GoogleSans 400, 13px, `rgba(255,255,255,0.82)`; bullet dot via `::before` pseudo-element (4px white circle at left)
- **Scroll reveal:** `data-reveal` on `equipInner` (grid wrapper) — both cards enter simultaneously, no stagger
- **Gun content:** label "Hardware", title "Combat Phaser", 5 features — ergonomic build, wireless charging, long-range targeting, LED indicators, modular internals; image: `gun.png`
- **Vest content:** label "Protection", title "Tactical Vest", 5 features — 360° sensors, front/back/shoulder coverage, LED feedback, adjustable fit, durable construction; image: `vest.png`
- **Responsive 1199px:** padding tightened to `28px 32px`
- **Responsive 900px:** padding `24px 24px`; overlay padding reduced
- **Responsive 640px:** section `height: auto`; grid collapses to 1 column; each card gets fixed `height: 260px`

### Laser Tag — Section 2: Why FOG's Laser Tag (USP Section) — v2 Dark Cards
- **Visual direction:** Each USP is a dark rounded card floating on white; replaced full-bleed divider rows with self-contained editorial cards (reference: dark portfolio card with ghost number)
- **Section:** White (`#ffffff`), `padding: 80px 36px 72px`, natural height (no `100vh`)
- **Inner wrap:** max-width 1440px, flex-column; `margin-bottom: 40px` header
- **Header:** eyebrow `"02 — Why FOG's Laser Tag"` (GoogleSans 500, `var(--accent)`, 4px tracking); H2 `"The FOG Advantage."` (ClashDisplay 700, `clamp(28px,4vw,56px)`, uppercase, `#0a0a0a`) — left-aligned
- **USP list:** `display: flex; flex-direction: column; gap: 16px`
- **Card (`.uspCard`):** `background: #111111; border-radius: 20px; overflow: hidden; grid-template-columns: 42fr 58fr; min-height: 340px` — hover `translateY(-3px)` spring `cubic-bezier(0.34,1.56,0.64,1)`
- **Card reverse (`.uspCardReverse`):** `grid-template-columns: 58fr 42fr`; CSS `order` properties swap image/content; JSX order unchanged
- **Ghost number (`.uspGhostNum`):** `position: absolute; top: 12px; right: 24px`; ClashDisplay 700, `clamp(80px,9vw,120px)`, `rgba(255,255,255,0.04)` — decorative watermark "1"/"2"/"3"
- **Image wrap:** `border-radius: 14px; margin: 14px 0 14px 14px` (reverse: `margin: 14px 14px 14px 0`) — inset image inside dark card
- **Content panel:** `padding: 40px 48px; position: relative; z-index: 2`
- **Category label (`.uspCategoryLabel`):** GoogleSans 500, 11px, 4px tracking, uppercase, `var(--accent)` — replaces old number + rule pair
- **Card title:** ClashDisplay 700, `clamp(18px,2.2vw,30px)`, uppercase, `#ffffff` (was `#0a0a0a`)
- **Body:** GoogleSans 400, 13px, `line-height: 1.8`, `rgba(255,255,255,0.52)` (was `rgba(19,19,19,0.62)`)
- **USP content:**
  - Card 1 — "Zero Downtime" / "15-Minute Swaps. Zero Revenue Loss." / `gun.png` — image left
  - Card 2 — "Arena Design" / "Custom Arenas Built for Repeat Bookings." / `arena.png` — image right (reverse)
  - Card 3 — "Operator First" / "Operator-First Software. Zero Extra Cost." / `vest.png` — image left
- **Responsive 1199px:** padding `72px 32px 60px`; content padding `32px 36px`
- **Responsive 900px:** cards collapse to single column; `uspImgWrap` always `order: 1` (above content) with `aspect-ratio: 16/9`; `!important` guards override reverse-card ordering
- **Responsive 640px:** aspect-ratio `4/3`; content padding `24px 20px 32px`; card title clamped to `clamp(16px,4.5vw,24px)`

### Laser Tag — Section 4: Moments Bento Grid
- **Source of truth:** Exact structural and visual port of HyperGrid Moments section — step-flow layout, card types, grid rhythm, and all animation classes are identical; only content (text, images, checklist items) belongs to Laser Tag
- **Section bg:** `var(--surface)` = `#F5F5F5` — corrected from old `var(--white)`; creates same tonal zone as HyperGrid moments
- **Inner padding:** `80px var(--sp-80) 80px` — normalised from old `100px var(--sp-80)` (matches HyperGrid spec)
- **Header block:** `momentsTop` — left-aligned (`text-align: left; margin-bottom: 64px`) replacing old `text-align: center; margin: 0 auto 64px`
- **Eyebrow added:** `"04 — Moments"` — GoogleSans 500, `var(--accent)` orange, 4px tracking, `clamp(10px,1vw,13px)` — was missing entirely from LT
- **Title corrected:** ClashDisplay **700**, `clamp(28px,4vw,56px)`, uppercase, `letter-spacing: -0.5px`, `line-height: 1.05` — was wrong weight (600), wrong size (`clamp(40px,6vw,52px)`), and wrong letter-spacing (`-2px`)
- **Step wrappers added:** Each card now wrapped in `momentsStep` div containing `momentsStepLabel` (orange dot + "Step 0X" text); `data-reveal` moved from single `momentsBento` container to each `momentsStep` with stagger `0.1/0.2/0.3/0.4s` — was a flat container with one single reveal
- **Editorial stagger:** `momentsStepOffset` (`margin-top: 56px`) applied to steps 2 & 4 — 1 high, 2 low, 3 high, 4 low cascade
- **Connector lines:** `momentsStep:not(:last-child)::after` — 1.5px orange-to-transparent gradient across the 20px gap; aligns at `top: 9px` (dot centre)
- **Step label row:** `momentsStepLabel` — orange dot (`9px`, glow `box-shadow: 0 0 8px rgba(240,80,35,0.55)`) + "Step 0X" text (GoogleSans 500, 11px, 3px tracking, orange)
- **Bento gap:** `gap: 12px` (uniform) → `gap: 0 20px` (horizontal only) — vertical rhythm is owned by the step cascade offsets, not the gap
- **Accent card gradient:** `#001a24 → #004d6b → var(--lt-cyan)` (cyan) → `#1a0a05 → #7a2308 → var(--accent)` (orange/brand) — unifies with site-wide orange accent language
- **Avatar colours:** `var(--lt-cyan)` base → `var(--accent)` orange base; nth-child(2) `#1a0a05`; nth-child(3) `#7a2308` — matches HyperGrid staggered dark tones
- **Check icon bg:** `var(--lt-cyan)` → `var(--accent)` — consistent accent colour
- **Icon circle bg:** `var(--lt-cyan)` → `var(--accent)`
- **Checklist refactored:** Hardcoded `div` repeats → `.map()` over data array (same pattern as HyperGrid) — preserves exact LT content (Book session, Select game mode, AI capture, Highlight clip, Leaderboard rank)
- **Accent card image:** Added `opacity: 0.35; mixBlendMode: 'luminosity'` inline — matches HyperGrid's desaturated image treatment on the accent card
- **momentsCardMedia:** Added `position: relative` (was missing in LT)
- **Responsive 1023px:** 2-col grid with `gap: 20px`; `momentsStepOffset` reset; connector lines hidden except col-1 odd steps
- **Responsive 767px:** 1-col, `gap: 32px` (was `8px`); all offsets and connectors reset

### Laser Tag — Section 3: Game Modes
- **Source of truth:** Exact structural and visual port of HyperGrid Game Modes V2 — layout, motion, and type spec are identical; only content (mode names, images, section eyebrow number) belongs to Laser Tag
- **Section:** `height: 100vh`, `display: flex; flex-direction: column`, `padding: 80px 36px`, white bg (`#ffffff`) — replaces old sticky-grid layout
- **Outer wrap:** `modesV2Wrap` — `flex: 1`, max-width 1440px, flex-column, `min-height: 0` — flex chain allows body to fill remaining height
- **Header block:** `modesV2Header` — `flex-shrink: 0`, `margin-bottom: 40px`; eyebrow `"03 — Game Modes"` (GoogleSans 500, `var(--accent)` orange, 4px tracking, clamp(10px,1vw,13px)); H2 title `"Game Modes"` (ClashDisplay 700, `clamp(28px,4vw,56px)`, uppercase, `#0a0a0a`, `-0.5px` tracking, `line-height: 1.05`)
- **Body grid:** `modesV2Body` — `flex: 1`, `grid-template-columns: 60fr 40fr`, `gap: 0 48px`, `min-height: 0` — image panel takes 60%, mode list 40%
- **Image panel (left):** `modesV2Left` — `position: relative; height: 100%`; `modesV2ImgWrap` fills full height with `next/image fill + objectFit: cover`; image swaps on `onMouseEnter` via `activeMode` state
- **Watch Gameplay button:** Absolutely positioned `bottom: 20px; left: 0` on the image; `background: rgba(9,9,9,0.6)`, `backdrop-filter: blur(8px)`, `border: 1.5px solid var(--accent)`, orange text; hover fills orange + `translateY(-2px)` with spring cubic-bezier `(0.34, 1.56, 0.64, 1)` — weight corrected from old `700` to `500` (ghost button spec)
- **Mode list (right):** `modesV2Right` — `align-self: start`; top/bottom `modesV2Line` dividers (`1px`, `rgba(19,19,19,0.12)`); each row is `modeItem` flex row with `justify-content: space-between`
- **Mode item inactive:** `opacity: 0.28` (corrected from old `0.22`); `transition: opacity 300ms ease`
- **Mode item active/hover:** `opacity: 1`
- **Mode name:** ClashDisplay **300** (decorative large — not a heading weight), `clamp(26px,3.2vw,44px)`, `line-height: 0.95`, `color: #131313`, `letter-spacing: -1.5px` — matches design-CLAUDE.md mode-name display spec exactly
- **Mode number:** ClashDisplay 700, 13px, `var(--accent)` orange, `letter-spacing: 2px`, `opacity: 0.8` (restores to `1` on active/hover) — number format changed from `{ 0X }` to clean `0X`
- **"New" badge:** Preserved on Save the President (idx 2) — GoogleSans 700, 9px, white text on `var(--accent)` fill, `padding: 3px 8px`
- **Responsive 1199px:** padding tightens to `72px 32px`; body gap narrows to `0 32px`; mode names scale down to `clamp(22px,2.8vw,38px)`
- **Responsive 900px:** section reverts to `height: auto; min-height: 100vh`; body becomes single column; image gets `aspect-ratio: 16/9`; video button drops to static position, backdrop removed
- **Responsive 640px:** image tightens to `aspect-ratio: 4/3`; mode name `clamp(24px,7vw,36px)`, `-1px` tracking; mode number 12px
- **Removed:** old `modesSection`, `modesWrap`, `modesTitle`, `modesLeft` (sticky), `modesImgWrap` (fixed aspect-ratio), `modesImg`, `modesRight`, `modesLine` class names — all replaced with V2 equivalents

### About — Section 1: Hero
- **Section height:** `height: 50vh; min-height: 320px` — intentionally compact; the photo does the work, not the text mass
- **Background:** `next/image` fill with `/images/about-us/about-us.jpg` (team at IAAPI National Awards for Excellence 2026); `object-position: center 22%` raises the frame to keep faces in view
- **Overlay:** 3-stop `linear-gradient(to bottom)` — `rgba(0,0,0,0.28)` at top → `rgba(0,0,0,0.58)` at 48% → `rgba(0,0,0,0.72)` at bottom — photo reads clearly in upper portion, text sits on dense shadow at center
- **Layout:** `justify-content: center; align-items: center; text-align: center` — content centred on both axes
- **Eyebrow:** `"01 — About FOG Technologies"` — GoogleSans 500, `var(--accent)` orange, `4px` tracking, `clamp(10px,1vw,13px)` — matches universal section eyebrow spec
- **H1:** `"Engineering the Future of Fun."` — ClashDisplay 700, `clamp(28px,4vw,56px)`, uppercase, `letter-spacing: -0.5px`, `line-height: 1.05` — exact H1 spec from `design-CLAUDE.md`
- **Sub-headline:** GoogleSans 300, `clamp(14px,1.6vw,18px)`, `rgba(255,255,255,0.55)`, `letter-spacing: 0.5px` — Body Lead spec; text cut to one tight line to suit the compact section height
- **Removed:** `heroBg` (flat dark div), `heroGrid` (dot pattern), `heroCta` (anchor link) — photo eliminates the need for artificial texture; CTA removed to reduce density at 50vh
- **Scroll indicator:** condensed to `height: 52px` (was 90px) to fit 50vh proportionally; `prefers-reduced-motion` guard added — dot freezes at mid-point instead of animating
- **Responsive:** `min-height: 320px` is the safety floor on small phones; eyebrow and title are fluid via `clamp()` so no custom breakpoint rules needed inside the hero

### About — Section 3: What Drives Us
- **Section bg:** `var(--surface)` = `#F5F5F5` — grey token from `globals.css`; intentional tonal break between the white Awards section above and later sections; no border needed
- **Header:** left-aligned (`text-align: left`); `margin-bottom: 52px` — tighter than the old 64px to keep section height unchanged
- **Eyebrow:** `"03 — What Drives Us"` — GoogleSans 500, `var(--accent)` orange, 4px tracking, `clamp(10px,1vw,13px)` — matches universal section eyebrow spec
- **H2 title:** `"Built on Four Principles."` — ClashDisplay 700, `clamp(28px,4vw,56px)`, uppercase, `letter-spacing: -0.5px`, `#0a0a0a` — corrected from old `clamp(34px,4.5vw,58px)` non-standard size; left-aligned per requirement
- **Grid:** `repeat(4, 1fr); gap: 18px` — unchanged column count, gap tightened slightly to match card padding rhythm
- **Card base:** `background: #ffffff` — white cards pop off the `#F5F5F5` surface; `border: 1px solid rgba(0,0,0,0.06)` — near-invisible on white; `border-top: 2.5px solid transparent` — reserves orange accent slot for hover
- **Card hover:** `transform: translateY(-5px)` spring cubic-bezier + `border-top-color: var(--accent)` reveals orange top stripe + `box-shadow: 0 18px 44px rgba(0,0,0,0.08)`; `prefers-reduced-motion` disables transform
- **Card layout:** `align-items: flex-start` — left-aligned content (was centred)
- **Index label:** `driveCardIndex` — GoogleSans 700, 10px, 2.5px tracking, orange — "01 / 02 / 03 / 04" above icon; `margin-bottom: 20px` gap to icon
- **Icon:** `driveIconWrap` — 48×48px, `border-radius: 12px` (rounded-rect, matches site icon language; was `50%` circle); `rgba(240,80,35,0.08)` tint; `margin-bottom: 20px` gap to title
- **H3 title:** `driveCardTitle` — ClashDisplay 700, `clamp(13px,1.5vw,19px)`, uppercase, `#0a0a0a` — proper H3 spec per `design-CLAUDE.md`; was bare `h3` tag with no class
- **Body:** `driveCardBody` — GoogleSans 400, 13px, `rgba(0,0,0,0.55)` — standard body role; was bare `p` tag, wrong color `var(--dark)`
- **Stagger:** `0 / 0.08 / 0.16 / 0.24s` across 4 cards — left-to-right cascade

### About — Section 4: The FOG Journey (Timeline)
- **Section bg:** `var(--surface)` = `#F5F5F5` — continues from What Drives Us; same tonal zone, no separation border needed
- **Header:** left-aligned; `margin-bottom: 72px` — extra breathing room before the timeline rows begin
- **Grid architecture:** `display: grid; grid-template-columns: 2fr 56px 3fr` — 3-column layout where left (sparse desc) : center (spine) : right (content) = 2 : 0.35 : 3; `display: contents` on `.tlRow` wrappers makes the wrapping div transparent so its 3 children flow directly into the parent grid
- **Left column — sparse blurbs:** Only items 0 (Founded 2019) and 3 (Product Line 2022) carry a `blurb`; all others are empty. `.tlBlurb` uses GoogleSans 300, `clamp(14px,1.6vw,18px)`, `rgba(0,0,0,0.52)` — Body Lead spec from dark-section equivalent, applied to light bg
- **Center column — continuous spine:** `.tlMidCell::before` draws a 1px vertical line from `top:0` to `bottom:-1px` (−1px bleed eliminates visible gaps between consecutive rows); last row uses `.tlMidCellLast` which terminates at `bottom: 50%` (dot centre); `.tlDot` is 10px accent circle with `box-shadow: 0 0 0 4px rgba(240,80,35,0.14)` pulse ring; hover scales dot and expands ring
- **Right column — content:** `.tlYear` — GoogleSans 700, 11px, 2px tracking, `var(--accent)` orange; `.tlNodeTitle` — ClashDisplay 700, `clamp(20px,2.5vw,30px)`, H2 spec, dark; `.tlNodeDesc` — GoogleSans 400, 13px, `rgba(0,0,0,0.52)`, max-width 440px
- **Removed:** stale `@media (min-width: 768px)` block that referenced old class names (`.tlLine`, `.tlItem`, `.tlItemRight`, `.tlItemLeft`, `.tlContent`, `.tlSpacer`) — these conflicted with new grid classes
- **Responsive 960px:** `grid-template-columns: 0 48px 1fr` — left column zeroed; `overflow: hidden` on `.tlLeftCell` prevents any blurb text from bleeding out
- **Responsive 640px:** `grid-template-columns: 0 36px 1fr` — spine narrows further; right cell padding reduces
- **Data:** `year: '2019'` added to Founded item; `side`/`delay` props removed (no longer needed in grid layout); `blurb` prop added to all 6 items (non-empty for items 0 and 3)

### About — Section 2: Awards & Recognition
- **Section bg:** `#ffffff` — white; contrasts cleanly with adjacent dark sections; `border-top: 1px solid rgba(0,0,0,0.06)` as a hair-line separator
- **Header layout:** `flex; justify-content: space-between; align-items: flex-end` — eyebrow + H2 left-aligned (per requirement), large "06" counter right-aligned as a visual anchor
- **Eyebrow:** `"02 — Awards & Recognition"` — GoogleSans 500, orange, 4px tracking — matches universal section eyebrow spec
- **H2 title:** `"Industry's Most Recognised Platform."` — ClashDisplay 700, `clamp(28px,4vw,56px)`, uppercase, `#0a0a0a` (white section text role per design-CLAUDE.md); left-aligned
- **Award counter (right):** `"06"` in ClashDisplay 700 at `clamp(52px,7vw,88px)` in `var(--accent)` orange — massive decorative number creates instant trust signal; `"Awards Won"` sub-label in GoogleSans 500 SM uppercase below
- **Grid:** Asymmetric bento — `grid-template-columns: 1.8fr 1fr 1fr; grid-auto-rows: minmax(200px,auto)` — 6 cards in 3 rows with deliberate size hierarchy:
  - Card 1 (featured, 2024 IAAPA): `grid-column: 1; grid-row: 1/3` — tall spanning card; orange left border `3px solid var(--accent)`; warm linear-gradient tint; larger icon (52px) + larger name size
  - Cards 2 & 3: small top-right cells; description hidden (too tight to read)
  - Card 4: `grid-column: 2/4; grid-row: 2` — wide horizontal layout (icon left, text right via `awardCardHoriz` flex-row)
  - Card 5: `grid-column: 1/3; grid-row: 3` — wide horizontal layout
  - Card 6: compact bottom-right cell
- **Year watermark:** `position: absolute; bottom; right` — ClashDisplay 700 at 86–152px depending on card size, `color: rgba(0,0,0,0.028)` — ghost text gives editorial depth without competing with content
- **Hover:** Spring cubic-bezier `(0.34, 1.56, 0.64, 1)` — `translateY(-7px)` lift + orange border tint + `box-shadow` — tactile and premium; `prefers-reduced-motion` disables transform
- **Card content z-index:** content at `z-index: 1`, watermark at `z-index: 0` — guaranteed layering inside `position: relative` card
- **Stagger reveal:** delays `0 / 0.07 / 0.12 / 0.18 / 0.24 / 0.30s` — natural cascade left-to-right, top-to-bottom
- **Responsive 1100px:** collapses to `1fr 1fr`; card 1 spans full width; cards 4 & 5 widen to full row; descs restored on formerly compact cards
- **Responsive 640px:** single column; all nth-child grid assignments reset to `auto`; horizontal cards revert to flex-column; awardsStat aligns left

### About Page — Section Map status update
- **Section 1 (Hero):** Done

### HyperGrid — Section 5: How It Works — v4 white section redesign
- **Section colour:** Background changed from `#090909` to `#ffffff`; `processHeaderWrap` border updated to `rgba(0,0,0,0.08)`; `processTitle` colour `#fff` → `#0a0a0a`; `processSub` colour `rgba(255,255,255,0.42)` → `rgba(0,0,0,0.42)` — consistent with white-section text colour roles in `design-CLAUDE.md`
- **Photo constrained to content width:** `processCanvas` removed from the flex-fill layout; now `max-width: 1440px; margin: 48px auto 0; aspect-ratio: 16/7` — photo sits within the same 1440px column as all other section content; `next/image fill` retained within the constrained container
- **"Click to Play" button relocated:** Moved out of `processHeaderWrap` and into a new `processFooter` div rendered after `processCanvas`; `display: flex; justify-content: center; padding: 40px ... 64px` — button is centred, well-spaced below the photo; border and text colour updated to dark (`rgba(0,0,0,0.22)` / `rgba(0,0,0,0.8)`) to read on white background
- **Active-unit highlight / non-active dimming:** New `.processUnitDimmed { opacity: 0.18 }` class; `processUnit` gains `transition: opacity 0.35s ease`; dimming logic computed inline with IIFE — when `processPlaying && processAnimStep 0–3`, every unit except the currently animating one receives `processUnitDimmed`; units restore to full opacity at step 4 (done) or when idle; makes the glide animation unambiguous
- **Vignette removed:** `processVignette` div and all associated CSS (`radial-gradient` + two `linear-gradient` layers) deleted — image reads clean, no dark gradient overlay
- **Build fix:** Missing `</div>` for `processCanvas` wrapper added (was silently unclosed, causing a Turbopack JSX parse error introduced in a prior session)
- **Responsive:** `processSection` no longer `height: 100vh`; `processHeaderInner` padding unchanged; `processInner` still hidden ≤1023px; `processFooter` padding collapses to `32px 20px 48px` ≤767px

### Get In Touch Section — Universal Design Unification
- **Shared Component:** Updated `ContactForm.tsx` to handle a `defaultProduct` prop for contextual pre-selection.
- **Contact Page Refactor:** Completely removed duplicated form logic/markup in `ContactClient.tsx` in favor of the shared component.
- **Design Parity:** Standardized all forms to use the premium dark-themed design originally implemented for HyperGrid.
- **Product Integrations:** Updated HyperGrid, Laser Tag, and Laser Spy clients to use the component with automatic product pre-selection (`hypergrid`, `lasertag`, `lasermaze`).
- **Cleanup:** Removed manual CSS overrides in product pages that forced inconsistent light/surface themes on the contact section.

### Testimonials Section — Universal Updates

- **Column split:** `400px 1fr` → `1fr 1fr` — equal halves at all widths; border-right divider `rgba(255,255,255,0.05)` separates panels
- **Section bg:** `#0d0d0d` with subtle `40px` dot-grid (`rgba(255,255,255,0.03)`) — matches specs section pattern for visual continuity
- **Dark-first form:** Right panel changed from `#fff` to `rgba(255,255,255,0.02)` — almost imperceptible against left panel, form reads as one unified dark block
- **Input/label styling (dark):** border-bottom `rgba(255,255,255,.1)`, input text `rgba(255,255,255,.85)`, floating label `rgba(255,255,255,.28)` — focused label snaps to orange per site accent
- **`labelFloatFilled`:** corrected from `rgba(0,0,0,.4)` → `rgba(255,255,255,.35)` (was invisible on dark bg)
- **Select options:** `background: #1a1a1a` — OS-native dark background in dropdown
- **Country dropdown:** bg `#1a1a1a`, border `rgba(255,255,255,.08)`, li text `rgba(255,255,255,.6)` — hover orange tint
- **Button:** changed from dark bg (`var(--dark)`) to `var(--accent)` orange fill — CTA must stand out on dark; hover darkens to `#d44415` + `-2px translateY` lift
- **Eyebrow:** `"Get In Touch"` added above headline — GoogleSans 500, orange, 4px tracking — consistent with all section eyebrows
- **Headline:** `clamp(38px,3.8vw,56px)` → `clamp(28px,3vw,48px)` — fits properly in 50% column width
- **formTitle:** `clamp(24px,2.8vw,38px)` → `clamp(22px,2.2vw,32px)` — right panel text no longer overflows in equal-width column
- **formDesc:** color `var(--gray)` (dark on white) → `rgba(255,255,255,.38)`, weight `300`, max-width `380px`
- **Padding adjustments:** left `padding: 80px 56px` → `80px 64px`; right `padding: 80px 96px 80px 80px` → `80px 72px 80px 64px` — balanced for equal-column layout

### Testimonials Section — Universal Updates
- **CMS Integration:** Switched all product pages (HyperGrid, Laser Tag, Laser Spy) and Home page to fetch testimonials from central markdown files (`content/testimonials/`) for data integrity.
- **Image Fixes:** Replaced all broken CDN and incorrect local paths (e.g., `.jpg` vs `.png`) with verified local assets from `/images/operators/`.
- **Sarah Chen Asset:** Specifically corrected `person-2.jpg` to `person-2.png` to resolve 404 errors.
- **HyperGrid Client:** Refactored to accept testimonials as props, removing hardcoded data and ensuring UI/UX consistency across all product lines.

### HyperGrid — Section 7: Specifications (Alignment Fix)
- **Grid Layout:** Updated `.speDataInner` to `align-items: stretch` to ensure the left dimensions card and the right info cards column always share the same height.
- **Card Scaling:** Applied `flex: 1` to `.speInfoCard` elements within the right column to distribute vertical space evenly, matching the visual weight of the left panel.
- **JSON-LD:** Fixed 403 error by replacing external CDN image with local `/images/hyper-grid/hyper-grid-1.png`.

### HyperGrid — Section 7: Specifications
- **Model image:** replaced CDN URL with local `/images/hyper-grid/specs/specs-1.png`
- **Data section column split:** `grid-template-columns: 1fr 1fr` → `3fr 2fr` — left dims card takes ~60%, right info cards ~40%, matching reference image proportions
- No other changes made to this section

### HyperGrid — Section 6: ROI Calculator
- Section bg: `#fff` (white — intentional contrast against the dark sections before/after)
- **Layout:** `height: 100vh`, flex column — header (flex-shrink:0) + body (flex:1, `grid-template-columns: 300px 1fr`) + footer (flex-shrink:0)
- Section eyebrow "05 — ROI Calculator" — GoogleSans 500, orange, 4px tracking — consistent with all sections
- Title "Your Returns, Calculated" — `clamp(28px, 4vw, 56px)`, ClashDisplay 700, uppercase, **dark (#131313)** — white section means dark title
- **Input panel (left):** `#f7f7f7` bg, 1px border, fields separated by subtle divider lines, labels `rgba(19,19,19,0.55)`, value in orange, range `accent-color: orange`, select on white bg with dark border
- **KPI strip (4 chips):** `repeat(4, 1fr)` grid
  - Total Investment, Monthly Revenue, Payback Period: `#f4f4f4` bg, dark value
  - Monthly Revenue + Payback: orange accent value
  - 5-Year ROI: **dark (#131313) hero chip** with `#22c55e` green value — the number B2B buyers care most about
- **Chart:** fills `flex:1` via flex chain — `calcChartArea (flex:1, flex-col)` → `calcChartWrap (flex:1, position:relative)` → `<canvas>` fills via `maintainAspectRatio: false`
  - Chart colors updated to white-mode: `rgba(19,19,19,0.05)` grid, dark ticks, GoogleSans font
  - Orange line (2.5px) with subtle orange fill above zero (break-even visual)
- **Removed:** bar chart (`chart-revenue` canvas), `barChartRef`, daily breakdown section — noise for B2B audience
- Footer: disclaimer left + CTA right — space-between layout

### Shared Testimonials Component — Universal Design Unification (v2)
- **Created `components/TestimonialsCarousel.tsx`** — self-contained shared component; takes `testimonials: Testimonial[]` + optional `heading?` prop
- **Carousel logic:** `tBusy` ref prevents race conditions; `tIdxForAuto` ref tracks current index inside setInterval; phase transitions: exiting → entering → visible (double rAF for CSS timing accuracy)
- **Design:** Exactly mirrors home page — white bg, ClashDisplay `clamp(40px,4.5vw,63px)` heading, `36%/1fr` photo+text grid, grayscale photo, 80px quote mark, orange divider, ClashDisplay quote at 30px, arrow siblings via `.testControls` flex row
- **All pages updated:** HyperGrid, Laser Tag, Laser Spy, Home — all now use `<TestimonialsCarousel testimonials={...} />`; removed all inline carousel state/callbacks from each client component
- **Home page cleanup:** Removed `toSlide` mapping function, `TestimonialSlide` interface, `tIdx/tPhase/tBusy/autoRef` state, `showTestimonial/startAuto` callbacks, `tContentRef/tImgRef` refs, unused `useCallback/useMemo` imports

### HyperGrid — Section 5: How It Works (Easy, Automated & Operator-Free) — v3 header/canvas split
- **Split layout:** Section is `flex-column, 100vh`
  - **`.processHeaderWrap`** — `flex-shrink: 0`, bg `#090909`, `border-bottom: rgba(255,255,255,0.05)` — title area has NO background image, consistent with dark-first aesthetic
  - **`.processCanvas`** — `flex: 1`, `position: relative` — houses the full-bleed `hyper-grid-6.png` BG + vignette + 4 floating boxes
  - Content max-width: 1440px via `.processHeaderInner`; canvas extends full viewport width
- **"Click to Play" button** — ghost style (`transparent bg, rgba(255,255,255,0.22) border`), hover fills orange; positioned after subtitle in header strip
- **Animation trigger changed:** IntersectionObserver removed → button click calls `handleProcessPlay()`; sequential timers: BL → TL → TR → BR, each 2 s window
- **Glide distance:** 3× → `33px` (was 11px) in all three keyframes (`hgGlideRight/Left/Up`)
- **Button states:** "Click to Play" (idle) → "Playing…" (disabled, 0.45 opacity) → "Play Again" (after step 4 done)
- **Responsive ≤1023px:** `.processCanvas` reverts to `aspect-ratio: 16/7`, `.processInner` hidden (boxes not shown on small screens)

### HyperGrid — Section 5: How It Works (Easy, Automated & Operator-Free) — v2 redesign
- **Layout:** Full `100vh` section — background image (`hyper-grid-6.png`) fills entire section via `next/image fill`; all content floats absolutely above it
- **Vignette:** 3-layer gradient overlay — radial ellipse kills corners/edges, LR linear gradient deeply darkens left/right thirds, TB gradient lightens top/darkens bottom; centre stays clear showing the room
- **4 step units — absolutely positioned in quadrants:**
  - Top-left (Step 1 — Tap the Card): `top: 34%`, `left: 3vw` — flex row, right-facing double-chevron arrow on right → glides right
  - Top-right (Step 4 — Watch Tutorial): `top: 30%`, `right: 3vw` — flex row, left-facing chevron on left → glides left
  - Bottom-left (Step 2 — Select the Game): `bottom: 10%`, `left: 3vw` — flex column, up-facing chevron below box → glides up
  - Bottom-right (Step 3 — Enter the Grid): `bottom: 10%`, `right: 3vw` — flex row, left-facing chevron on left → glides left
- **Box style:** `rgba(0,0,0,0.70)` bg, `1px rgba(255,255,255,0.18)` border, `backdrop-filter: blur(2px)`; orange step eyebrow, ClashDisplay 700 uppercase title, GoogleSans 300 uppercase desc at `rgba(255,255,255,0.52)`
- **Arrow SVGs:** Hand-drawn double-chevron polylines in orange (`var(--hg-neon-orange)`) — right `»`, left `«`, up `∧∧`
- **Sequential glide animation (IntersectionObserver triggered at 35% threshold, runs once):**
  - BL first (0.3s after reveal), TL second (+2s), TR third (+4s), BR last (+6s)
  - Each unit runs its direction keyframe (`hgGlideUp/Right/Left`) for exactly 2s, 1 iteration — oscillates ±11px twice then stops
  - `prefers-reduced-motion` guard disables all animations
- **Subtitle:** "Crowd-Pulling Profit Machine" — GoogleSans 300, 3px tracking, `rgba(255,255,255,0.42)` — added below title
- **Responsive ≤1023px:** Section reverts to `height: auto; min-height: 100vh`, processInner becomes `position: relative` flex column, all arrow elements hidden, boxes stack as full-width rows

### HyperGrid — Section 5: How It Works (Easy, Automated & Operator-Free)
- Section bg: `#090909` (dark, matches rest of page)
- **Layout:** `height: 100vh`, flex column — header (flex-shrink:0) + body (flex:1, flex-col)
- **Stage image:** `hyper-grid-5.jpg` fills flex:1 via `next/image fill`, `object-position: center 30%`, rounded corners; gradient overlay (sides + bottom) fades image to black at bottom edges
- **Cards:** 4 static cards in `repeat(4, 1fr)` grid, `margin-top: -52px` to overlap gradient fade area — cards float over the darkened bottom of the image
  - Each card: white-bordered image frame (`aspect-ratio: 4/3`, 1px rgba border), orange `STEP 0X` eyebrow, ClashDisplay 700 title, GoogleSans 300 desc
  - Card images from `/images/hyper-grid/automated/card-1.png` through `card-4.png`
  - `data-reveal` stagger 0.1/0.2/0.3/0.4s
- **Removed:** all carousel logic (`activeStep` state, `processNav`, `processBtn` navigation, `processSlide`/`processSlideActive` — section is now fully static)
- Section eyebrow "04 — How It Works" — GoogleSans 500, orange, 4px tracking — consistent with sections 2, 3, 4
- Title "Easy, Automated & Operator-Free" — `clamp(28px, 4vw, 56px)`, ClashDisplay 700, uppercase, white — matches all other section titles exactly
- Responsive: ≤1023px stage drops `flex:1` → `aspect-ratio: 16/7`, cards switch to 2-col grid; ≤767px stage `aspect-ratio: 16/9`; ≤480px single column

### HyperGrid — Section 4: Moments in HyperGrid
- Section bg: `var(--surface)` — unchanged
- Title position: left-aligned, unchanged
- **Text consistency fixes:**
  - `momentsTitle` `font-weight: 600` → `700`, `font-size: clamp(40px,6vw,52px)` → `clamp(28px,4vw,56px)` — now matches `modesV2Title` exactly
  - `word-spacing: 6px` removed, `margin-bottom: 20px` removed (title margin-bottom was wrong — moved to `momentsTop`)
  - `momentsTop margin-bottom: 60px` → `64px` (matches section header rhythm)
- Added section eyebrow "03 — Moments" — GoogleSans 500, orange, 4px tracking — consistent with sections 2 and 3
- **Step-flow layout:** Each card wrapped in `.momentsStep` with `.momentsStepLabel` (orange dot + "Step 01/02/03/04" text) above it
  - Connector line drawn via `.momentsStep:not(:last-child)::after` pseudo-element in the 20px grid gap — linear-gradient from orange to transparent
  - Step label has `border-bottom: 1px solid rgba(240,80,35,0.18)` as visual baseline
  - `.momentsStepOffset` applied to steps 2 & 4 → `margin-top: 56px` — editorial cascade: 1 at top, 2 lower, 3 at top, 4 lower — not a plain equal grid per ui-ux-CLAUDE.md
  - Individual `data-reveal` on each step with 0.1/0.2/0.3/0.4s stagger — removed container data-reveal
- Responsive: 2-col at ≤1023px (cascade reset, connectors on odd columns only), 1-col at ≤767px (all offsets reset, connectors hidden)

### HyperGrid — Section 3: Game Modes
- Layout: `grid-template-columns: 60fr 40fr` with `gap: 0 48px` — image panel fills ~60% of 1440px container, text panel takes ~40%; section padding kept at `36px` sides so effective split at 1440px ≈ 792px image / 528px text
- Title moved into right panel (was spanning both columns) — left panel is now clean, image-only
- Added section eyebrow "02 — Game Modes" — GoogleSans 500, orange, 4px letter-spacing, consistent with section 2 eyebrow style
- Image aspect-ratio: `2/1` → `3/2` — taller at 60% width = more visual presence (~528px tall at 1440px)
- Sticky top: `220px` → `100px` — image locks closer to viewport top while scrolling through mode list
- `modesVideoBtn` hover: added `translateY(-2px)` lift, explicit transition properties — consistent with hero buttons
- **Text consistency fixes per design-CLAUDE.md:**
  - `modesV2Title` `font-weight: 600` → `700` (ClashDisplay headings must be 700)
  - `modeItemName` `font-weight: 100` → `300` (design system minimum for subtext)
  - `modeItem` inactive `opacity: 0.22` → `0.28` (more readable, less stark)
  - Mode number format `{ 01 }` → `01` (clean, matches site numbering convention)
  - `modesVideoBtn` `font-weight: 700` → `500` (UI label weight per design system)
  - `modesV2Line` opacity `0.1` → `0.12` (slightly more visible divider)
- Section bottom padding: `18px` → `100px`
- Responsive: `60fr 40fr` holds to 1199px, stacks to single column at ≤900px
- **v2 update:** Section height set to `100vh` using `display: flex` chain — wrap fills section, body grid fills wrap, image fills body cell
- Title + eyebrow moved out of right panel into full-width `modesV2Header` above body grid — matches `whatHeading` size exactly (`clamp(28px, 4vw, 56px)`, `700`, uppercase, `margin-bottom: 40px`)
- `aspect-ratio` removed from `modesV2ImgWrap`; replaced with `height: 100%` so image fills full body height
- "Watch Gameplay" button now overlaid bottom-left on image (`position: absolute`) with dark blur backdrop — image panel is now fully uninterrupted
- Responsive ≤900px: section reverts to `min-height: 100vh`, single column, image gets `aspect-ratio: 16/9`, button reverts to static position

### HyperGrid — Section 2: What is HyperGrid (v2 redesign)
- Section background changed to `#090909` (dark-first, consistent with rest of page)
- Added `"WHAT IS HYPERGRID?"` heading in ClashDisplay 700, uppercase, white
- Replaced full-width 3D render + dark info cards with a neon tech frame design matching client reference:
  - Frame: cyan (`--hg-neon-cyan`) left/right/bottom borders, orange top border, double inner-line effect via `::before` pseudo-element, multi-layer `box-shadow` glow
  - `"HYPER GRID"` badge centered at top of frame — orange neon border + glow, ClashDisplay 700, 6px letter-spacing
- 3 polaroid-style photo cards (editorial collage layout):
  - Cards: `#f8f8f0` white frame, `padding: 10px 10px 48px` (classic polaroid bottom-weight), deep shadow stack
  - Images: `hyper-grid-5.jpg`, `modes/find-the-color.jpg`, `hyper-grid-1.png`
  - Rotations: −2.5° / +1.5° / −1.5° via separate CSS classes (`.whatCardWrap1/2/3`)
  - Hover: rotate to 0° + `translateY(-10px)`, spring cubic-bezier — `prefers-reduced-motion` guard
- `data-reveal` placed on plain wrapper divs above the rotation divs to prevent transform conflicts
- Card stagger: 0.15s / 0.25s / 0.35s delays
- Captions below each polaroid in ClashDisplay 700 uppercase white on dark background
- Mobile: rotations reset to 0deg, inner frame double-lines hidden, single-column layout

### HyperGrid — Section 1: Hero
- Video source corrected to `/videos/hypergrid-bg-video.mp4` (background + modal)
- Added cinematic multi-layer gradient overlay (radial + linear) for video depth — video stays visible in upper half, pulls to near-black at lower third where text sits
- Fixed hero positioning: replaced `justify-content: center` + `margin-top: 480px` hack with `justify-content: flex-end` on `.hero` + `align-self: flex-end` + `padding-bottom: clamp(64px, 8vh, 120px)` on `.heroContent` — text anchors to lower third correctly across all viewport heights
- Added eyebrow label "LED Interactive Floor Gaming" — GoogleSans, 500 weight, `#F05023`, 4px letter-spacing, uppercase — gives B2B visitors instant product category context before reading the title
- Added sub-headline "Where the floor becomes the game" — GoogleSans 300 weight, `rgba(255,255,255,0.55)`, below title
- Staggered `data-reveal` delays: eyebrow 0s → title 0.12s → sub 0.22s → buttons 0.32s
- HUD corners: added `@keyframes hudDraw` (scale 0.6 → 1, opacity 0 → 0.55) with staggered delays (0.4–0.7s), spring cubic-bezier — wrapped in `prefers-reduced-motion` guard
- Added bobbing scroll chevron at hero bottom — `@keyframes scrollBob`, opacity + 6px Y travel, `prefers-reduced-motion` guard
- Button hover: replaced generic `transition: all` with explicit property list; added `-2px translateY` lift on all `.hbtn`; solid variant glow `rgba(240,80,35,0.45)`, ghost variant `rgba(255,255,255,0.12)`

### Blog Post Page — Left ToC Panel + White Layout Redesign
- **Background:** White (`#ffffff`), `margin-top: 60px` navbar clearance, `padding: 56px 0 96px`; max-width 1440px container with `clamp(24px,5vw,80px)` horizontal padding
- **Back button:** Ghost pill at top — `border: 1px solid rgba(0,0,0,0.15)`, `border-radius: 100px`, GoogleSans 500, 12px, 1.5px tracking, uppercase, `#0a0a0a`; hover → orange border + orange text; SVG left-arrow icon (14px, `stroke-width: 2.2`)
- **Meta row (below back, above title):** Three pill variants side-by-side:
  - Category: dark bg pill (`rgba(0,0,0,0.07)`, `border-radius: 4px`, 11px, 1.5px tracking, uppercase, `#0a0a0a`)
  - Date: border pill (`border: 1px solid rgba(0,0,0,0.12)`, muted `rgba(0,0,0,0.45)`)
  - Read time: orange tint pill (`rgba(240,80,35,0.08)` bg, `var(--accent)` text) — matches blog listing card meta spec exactly for visual consistency
- **H1:** ClashDisplay 700, `clamp(28px,4.5vw,52px)`, uppercase, `letter-spacing: -0.5px`, `#0a0a0a` — standard site H1 spec; `max-width: 860px`
- **Excerpt:** GoogleSans 300, `clamp(15px,1.5vw,18px)`, `line-height: 1.65`, `rgba(0,0,0,0.52)` — Body Lead spec
- **Cover image:** Full container width, `aspect-ratio: 16/9`, `border-radius: 16px`, `margin-bottom: 60px`
- **Two-column layout:** `grid-template-columns: 260px 1fr; gap: 60px; align-items: start` — left panel is sticky; collapses at ≤900px
- **Left panel (`PostTocClient.tsx`, 'use client'):**
  - **Reading progress:** Vertical 3px track (`rgba(0,0,0,0.08)` bg) × 100px tall; orange fill height driven by `window.scrollY / (scrollHeight - clientHeight) * 100`; percentage displayed as ClashDisplay 700, 22px with "read" sub-label in GoogleSans 10px uppercase — big number creates instant visual feedback
  - **Table of contents:** H2/h3 headings extracted server-side via regex, IDs injected into HTML with `injectHeadingIds()` helper; `IntersectionObserver` with `rootMargin: '-15% 0% -70% 0%'` tracks active section; active link gets orange color + 2px left border; sub-headings (`h3`) indent 26px and use 12px; smooth scroll on click
  - **Share:** Three icon buttons (X/Twitter, LinkedIn, Facebook) — 36×36px, `border-radius: 8px`, `rgba(0,0,0,0.05)` bg; hover fills orange + `translateY(-2px)` spring
  - **CTA:** Dark pill button (`background: #0a0a0a`), `border-radius: 100px`, fills full panel width; hover → orange + `-2px` lift
- **Mobile panel (≤900px):** Drops sticky positioning → flat horizontal flex row inside a `border: 1px solid rgba(0,0,0,0.08)` rounded card (`border-radius: 12px`, `background: #fafafa`); progress block hidden; ToC and share blocks wrap inline
- **Prose (right column):** GoogleSans body prose — `clamp(15px,1.5vw,17px)`, `line-height: 1.78`, `#2a2a2a`; H2 ClashDisplay 700 uppercase `clamp(20px,2.5vw,28px)`; blockquote orange left border + `rgba(240,80,35,0.04)` tint bg + `border-radius: 0 8px 8px 0`; images `border-radius: 8px`
- **End CTA strip:** `border-top: 1px solid #e8e8e8`, flex row with label left + dark pill CTA right; hover fills orange
- **More Posts grid:** Below layout — H2 "More from the Blog" (ClashDisplay 700, uppercase, `clamp(20px,2.5vw,32px)`); `repeat(3,1fr)` card grid (same card design as blog listing: image 16/9 + category orange label + ClashDisplay title + "Read More" text); filters out current slug; collapses to 2-col at ≤1100px, 1-col at ≤600px
- **Heading ID injection:** `extractHeadings(html)` + `injectHeadingIds(html)` server-side helpers in `page.tsx` — regex walks `<h2>/<h3>` tags, slugifies text → `id="heading-slug"`, enables anchor + ToC scroll targeting
- **No `data-reveal`:** None used anywhere on this page — all elements are static server or client rendered; `data-reveal` unsafe on client-component output (opacity: 0.001 remains permanently)
