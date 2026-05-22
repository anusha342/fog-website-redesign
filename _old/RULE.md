# FOG Technologies — Project Design Rules

---

## 1. Color System

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#F05023` | CTAs, highlights, active states |
| `--dark` | `#131313` | Text on light backgrounds, dark cards |
| `--white` | `#FFFFFF` | Text on dark, light section backgrounds |
| `--surface` | `#F5F5F5` | Light section backgrounds |
| `--gray` | `#888888` | Secondary body text, muted labels |

**Dark section backgrounds — use in this order only (do not mix arbitrarily):**
- `#080808 / #090909` — deepest dark (hero, product pages)
- `#0a0a0a` — page-level dark background
- `#111111 / #131313` — card/section elevations on dark

**Text opacity on dark backgrounds:**
- Primary: `rgba(255,255,255, 0.92–1)`
- Body: `rgba(255,255,255, 0.6–0.75)`
- Muted: `rgba(255,255,255, 0.45–0.5)`
- Very muted / meta: `rgba(255,255,255, 0.22–0.35)`

**Text on light backgrounds:**
- Primary: `var(--dark)` → `#131313`
- Body: `var(--gray)` → `#888888`
- Muted: `rgba(19,19,19, 0.55–0.68)`

---

## 2. Per-Product Accent Colors

| Product | Accent Color | CSS Variable |
|---|---|---|
| HyperGrid | `#F05023` (brand orange) | `--hg-accent` |
| Laser Tag | `#F05023` (brand orange) | `--lt-accent` |
| Laser Spy | `#F05023` (brand orange) | `--ls-accent` |
| Moments | `#F05023` (brand orange) | `--mo-accent` |

---

## 3. Typography

| Role | Font | Size | Weight | Case | Letter-spacing |
|---|---|---|---|---|---|
| Hero title (product pages) | Expansiva | `clamp(48px, 9vw, 110px)` | 700 | UPPERCASE | `-1px` |
| Hero title (about / home) | ClashDisplay | `clamp(44px, 6.5vw, 88px)` | 700 | Title case | `-1.5px` |
| Section headings | ClashDisplay | `clamp(32px, 4.5vw, 56px)` | 600–700 | UPPERCASE | `-0.5px` |
| Body / descriptions | GoogleSans | `14–17px` | 300–400 | Normal | normal |
| Buttons / CTA text | GoogleSans | `13px` | 500 | UPPERCASE | `1.5px` |
| Stat / number display | ClashDisplay | `clamp(44px, 5–8vw, 68–112px)` | 700 | — | `-1px to -3px` |

**Hard rules:**
- Buttons always use GoogleSans 13px — never ClashDisplay
- Remove eyebrows from the section if they have any
- Section headings always use ClashDisplay Semibold OTF
- Body text and descriptions always use GoogleSans
- Expansiva is used **only** for hero product-page titles and the animated FOG logo on the home page

---

## 4. Buttons

`border-radius: 0` on all buttons — no exceptions, ever.

| Variant | Background | Border | Text | Height | Hover |
|---|---|---|---|---|---|
| Solid (primary) | `var(--accent)` | `1.5px solid var(--accent)` | `#fff` | `44–52px` | `#c93d18` + `box-shadow: 0 0 32px rgba(240,80,35,0.45)` |
| Ghost (secondary) | `rgba(255,255,255,0.04)` | `1.5px solid rgba(255,255,255,0.22)` | `rgba(255,255,255,0.82)` | `44–52px` | Accent border + `rgba(accent,0.06)` bg |
| Outline (accent) | `transparent` | `1.5px solid [product accent]` | Product accent | `40–48px` | Fill with accent color |

**Button text:** GoogleSans, 13px, uppercase, `letter-spacing: 1.5px`, `padding: 0 20–28px`

---

## 5. Navbar

- Fixed, `height: 64px`, inner content `max-width: 1440px`, `padding: 0 80px`
- Background: glassmorphism — `backdrop-filter: blur(18px) saturate(1.6)` with dark gradient
- Borders: `border-top: 1px solid rgba(255,255,255,0.15)`, `border-bottom: 1px solid rgba(0,0,0,0.4)`
- Links: 15px GoogleSans, `rgba(255,255,255,0.8)`, accent underline slides `width: 0 → 100%` on hover
- Hide on scroll-down / reveal on scroll-up via `translateY(-100%)`
- Active page link gets `class="nav-active"` — underline always visible
- CTA button: solid accent, `border-radius: 0`, 13px uppercase GoogleSans

---

## 6. Section Layout

```css
/* Full-width section — background spans 100% viewport width */
.section-name {
  width: 100%;
  padding: 100px clamp(24px, 6vw, 96px);
}

/* Content constrained to 1440px, centered */
.section-inner {
  max-width: 1440px;
  margin: 0 auto;
}
```

- **Never** apply `max-width: 1440px` directly on the section element that has a distinct background
- Alternate sections dark → light → dark, or use `border-top: 1px solid rgba(255,255,255,0.06)` to separate adjacent dark sections
- Mobile section padding drops to `72px 20px` at `< 640px`

---

## 7. Cards

**On dark backgrounds:**
```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.07–0.08);
border-radius: 12px;
padding: 28–36px 24–32px;
/* Hover */
border-color: rgba(240,80,35,0.22–0.3);
background: rgba(240,80,35,0.03–0.05);
```

**On light backgrounds:**
```css
background: var(--white);
border: 1px solid rgba(19,19,19,0.07–0.08);
border-radius: 12px;
/* Hover */
border-color: rgba(240,80,35,0.25);
box-shadow: 0 6px 24px rgba(240,80,35,0.07);
```

**Technical / spec / data cards:** `border-radius: 0` (sharp corners, no radius)

---

## 8. Eyebrow Labels

```css
font-size: 11–13px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 3–6px;
display: block;
margin-bottom: 12–18px;

color: var(--accent);   /* on dark backgrounds */
color: var(--dark);     /* on light backgrounds */
```

---

## 9. Hover & Interactive States

| Element | Hover Treatment |
|---|---|
| Nav links | Accent underline expands left → right |
| Solid buttons | `#c93d18` + `box-shadow: 0 0 32px rgba(240,80,35,0.45)` |
| Ghost buttons | Accent border + faint accent bg |
| Cards (dark) | Accent border + faint accent bg fill |
| Cards (light) | Accent border + accent box-shadow |
| Text links | Accent color + underline `width: 0 → 100%` |
| Interactive list items | `opacity: 0.22` inactive → `opacity: 1` on hover/active |
| Card bottom-bar effect | `width: 48px → 100%` orange bottom bar animates on hover |

All hover transitions: `200–300ms cubic-bezier(.4,0,.2,1)`

---

## 10. Scroll Reveal Animation

Apply `data-reveal` to any element that should animate in on scroll.

```css
[data-reveal] {
  opacity: 0.001;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(.25,.46,.45,.94),
              transform 0.7s cubic-bezier(.25,.46,.45,.94);
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

**Available stagger delays** (use `data-reveal-delay="X"` attribute):
`0.05` | `0.08` | `0.1` | `0.12` | `0.15` | `0.16` | `0.2` | `0.24` | `0.3`

---

## 11. Background Treatments

| Pattern | CSS |
|---|---|
| Dot grid | `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)` at `40px 40px` |
| Line grid | `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)` + `90deg` at `40px 40px` |
| Accent radial glow | `radial-gradient(ellipse at 70% 50%, rgba(240,80,35,0.06) 0%, transparent 60%)` |
| Product hero gradient | `radial-gradient(ellipse 120% 80% at 50% 0%, accent → page dark bg)` |

---

## 12. SVG Icons

- Always: `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`, `aria-hidden="true"`
- Size: `22–32px` for section/card icons, `18px` for button arrows
- Color is inherited via `currentColor` — never hardcode a color on an icon
- Never use emoji as icons

---

## 13. Spacing System

Always use these CSS variable tokens. Do not use arbitrary pixel values.

| Token | Value |
|---|---|
| `--sp-4` | `4px` |
| `--sp-8` | `8px` |
| `--sp-16` | `16px` |
| `--sp-24` | `24px` |
| `--sp-32` | `32px` |
| `--sp-48` | `48px` |
| `--sp-64` | `64px` |
| `--sp-80` | `80px` |
| `--sp-96` | `96px` |

---

## 14. Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| `< 1199px` | 4-col grids → 2-col; reduce horizontal padding |
| `< 1100px` | Stats grids, value cards → 2-col |
| `< 900px` | Side-by-side layouts collapse; sticky panels become static |
| `< 767px` | Full mobile: single column, hamburger nav visible |
| `< 640px` | Section padding → `72px 20px`; hero title `font-size` scales down |

---

## 15. Component Reuse

- **Footer** and **Get-In-Touch form** (`#get-in-touch`) are shared components from `index.html` — never create new versions for other pages
- The Get-In-Touch form is duplicated in HTML across pages but must remain structurally identical
- Product pages pre-select their product in the form dropdown via JS

---

## 16. Page-Level Conventions

- Every page `<body>` gets a scoped class: `hypergrid-page`, `lasertag-page`, `laserspy-page`, `moments-page`, `about-page`, `blog-page`
- All CSS/JS `<link>` and `<script>` `src` attributes use version query strings (`?v=1.1`) — increment on breaking changes to bust cache
- `data-nav-theme="light|dark"` attribute on sections triggers navbar theme switching on scroll (used on HyperGrid page)
- Navbar is duplicated in every HTML file — keep the same structure across all pages
- Active nav link always has `class="nav-active"` on the current page's anchor
