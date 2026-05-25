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
| 6 | ROI Calculator (slider inputs + Chart.js output) | Pending |
| 7 | Specifications (3D model + dimension + tech spec cards) | Pending |
| 8 | Testimonials Carousel (auto-advance, phase-based animations) | Pending |
| 9 | Get In Touch (shared ContactForm, product pre-selected) | Pending |

---

## Home Page — Section Map

| # | Section | Status |
|---|---|---|
| 1 | Hero (Three.js canvas, FOG text, CTA buttons, scroll indicator) | Pending |
| 2 | Logo Strip (marquee) | Pending |
| 3 | About & Numbers (stats cards) | Pending |
| 4 | Products Sticky Stack (5 product sections) | Pending |
| 5 | Testimonials Carousel | Pending |
| 6 | Globe | Pending |
| 7 | Blog Cards | Pending |
| 8 | Get In Touch (contact form) | Pending |

---

## Session Log

> Entries are appended here after each section is completed. Most recent entry is at the top.

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
