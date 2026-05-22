# FOG Technologies — Future of Gaming Website

## Project Overview

Static multi-page marketing website for **FOG Technologies**, a company that sells location-based entertainment products (laser tag, LED gaming floors, AI highlight systems) to venues like FECs, malls, hotels, and arcades.

**No framework. No build tools. Pure HTML, CSS, and vanilla JavaScript.**

---

## File Structure

```
future-of-gaming/
├── index.html           # Home page (hero, products, testimonials, globe, get-in-touch form, footer)
├── about.html           # About page (story, values, numbers, products grid)
├── contact.html         # Contact page (hero, info strip, get-in-touch form, footer)
├── blog.html            # Blog page (sidebar tabs + markdown-rendered posts)
├── hyper-grid.html      # HyperGrid product page (LED gaming floor)
├── laser-tag.html       # Laser Tag product page
├── laser-spy.html       # Laser Spy product page (laser beam maze)
├── moments.html         # Moments product page (AI highlight clips)
│
├── css/
│   ├── style.css        # Global styles, CSS variables, navbar, footer, get-in-touch form
│   ├── hyper-grid.css   # HyperGrid-specific styles
│   ├── laser-tag.css    # Laser Tag-specific styles
│   ├── laser-spy.css    # Laser Spy-specific styles
│   ├── moments.css      # Moments-specific styles
│   ├── about.css        # About page styles
│   ├── contact.css      # Contact page styles
│   └── blog.css         # Blog page styles
│
├── js/
│   ├── main.js          # Shared: country combobox, form handling, scroll reveal (data-reveal), navbar hide-on-scroll, mobile menu
│   ├── hero.js          # Three.js particle canvas for index.html hero
│   ├── fog-text.js      # FOG ↔ "Future of Gaming" hover animation on index.html
│   ├── globe.js         # amCharts 5 globe/map on index.html
│   ├── geo.js           # Geolocation + IP detection for index.html
│   ├── hyper-grid.js    # HyperGrid page scroll animations (GSAP + Lenis)
│   └── blog.js          # Blog: fetches markdown files, renders posts, handles sidebar tabs
│
├── images/
│   ├── company_logo.png
│   ├── hyper-grid/      # hyper-grid-1..5 images
│   ├── laser-tag/       # laser-tag-1.png
│   ├── laser-spy/       # laser-spy-1.jpg
│   └── operators/       # person-1..3 (testimonial photos)
│
└── videos/
    ├── clip1.mp4        # Used in hyper-grid.html hero
    └── clip2.mp4        # Used in moments.html hero
```

---

## Design System

### CSS Variables (defined in `css/style.css`)

```css
--accent:   #F05023   /* Brand orange — primary CTA, highlights */
--dark:     #131313   /* Near-black for light sections */
--white:    #ffffff
--surface:  #F5F5F5   /* Light grey background */
```

### Typography

| Role | Font | Notes |
|------|------|-------|
| Body / section content | GoogleSans VariableFont | All paragraph text, descriptions, form fields, button labels |
| Headings/display | ClashDisplay Semibold | `ClashDisplay-Semibold.otf` — used for all display headings, product names, stat numbers |
| Logo / stat numbers | Expansiva | Loaded via @font-face in style.css |

> **Rule**: Every button's text must use `GoogleSans`. Every bold heading uses `ClashDisplay-Semibold.otf` (not Bold). Body/paragraph content always uses `GoogleSans`.

### Spacing / Layout

- Section content max-width: **1440px** centered with `margin: 0 auto`
- Section padding: `100px clamp(24px, 6vw, 96px)`
- Mobile breakpoints: `640px`, `900px`, `1100px`

### Per-Product Accent Colors

| Product | Accent | Variable |
|---------|--------|----------|
| HyperGrid | `#F05023` (brand orange) | `--hg-accent` |
| Laser Tag | `#00c8ff` (cyan) | `--lt-cyan` |
| Laser Spy | `#39ff14` (neon green) | `--ls-green` |
| Moments | `#F05023` (brand orange) | `--mo-accent` |

---

## Navigation Structure

All pages share the same navbar structure. The navbar is duplicated in every HTML file (not server-side included).

```html
<!-- Desktop nav links (same across all pages) -->
<li><a href="index.html#products-wrapper">Products</a></li>
<li><a href="about.html">About</a></li>
<li><a href="blog.html">Blog</a></li>
<li><a href="#get-in-touch">Contact</a>  <!-- or index.html#get-in-touch on blog.html -->
```

- **Active state**: `class="nav-active"` on current page's link
- **Contact / Get In Touch**: scrolls to `#get-in-touch` form using `scrollIntoView({ behavior:'smooth', block:'center' })`
- The inline scroll JS is added at the bottom of every page that has a `#get-in-touch` section

---

## Shared Scroll-to-Contact Pattern

Every page with a `#get-in-touch` form has this inline script before `</body>`:

```html
<script>
  document.getElementById('nav-cta-btn').addEventListener('click', function() {
    document.getElementById('get-in-touch').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.querySelectorAll('a[href="#get-in-touch"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('get-in-touch').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
</script>
```

`blog.html` is the exception — it has no form, so its Contact link goes to `index.html#get-in-touch`.

---

## CDN Dependencies

Every page loads (before local scripts):

```html
<script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

Additional (index.html only):
- Three.js (hero particle canvas)
- amCharts 5 + geodata + Animated theme (globe section)

Additional (blog.html only):
- `marked.min.js` (markdown rendering)

---

## Scroll Animations

`main.js` sets up an `IntersectionObserver` for all `[data-reveal]` elements:

```html
<h2 data-reveal>Title</h2>
<p data-reveal data-reveal-delay="0.1">Body</p>
```

CSS transitions handle the enter animation (opacity + translateY). `data-reveal-delay` maps to a `transition-delay`.

---

## Get In Touch Form (`#get-in-touch`)

The form is duplicated in every page that includes it. Key fields:
- Name, Email, Country (searchable combobox with full country list in `main.js`)
- Product of Interest (select: HyperGrid, Laser Tag, Laser Spy, Moments AI, Other)
- Message textarea
- Submit button

Product pages pre-select their product in the dropdown.

Form submit is handled by `main.js` — currently a front-end-only implementation (backend TBD).

---

## Blog System

- Posts are markdown files (fetched dynamically by `blog.js`)
- Sidebar tabs filter by category
- `marked.js` renders markdown to HTML client-side
- Layout: `320px` sidebar + `1fr` content, max-width `1440px`

---

## Key Conventions

- **No emoji as icons** — use inline SVG with `stroke="currentColor"` so they inherit the element's `color`
- **`data-nav-theme`** attribute on sections tells the navbar (in `hyper-grid.js`) to switch between light/dark modes as the user scrolls
- **Body class per page**: `hypergrid-page`, `lasertag-page`, `laserspy-page`, `moments-page`, `blog-page`, `about-page` — used to scope CSS
- **Version query strings** on CSS/JS links (e.g. `?v=1.1`) — increment when making breaking changes to bust cache
- **SVG icons use `aria-hidden="true"`** since they are decorative; surrounding text provides the label
- **Section background pattern**: Every section background must span the full viewport width. Content (text, grids, cards) must be constrained to `max-width:1440px` using an inner wrapper element — never apply `max-width:1440px` directly on the `<section>` element that has a distinct background color.
  ```css
  /* Correct pattern */
  #my-section { background: #f5f5f5; padding: 100px clamp(24px, 6vw, 96px); width: 100%; }
  .my-section-inner { max-width: 1440px; margin: 0 auto; }
  ```
- **Fonts summary**: Buttons → `GoogleSans`; Display headings → `ClashDisplay` (Semibold OTF); Body content → `GoogleSans`

---

## Products Summary

| Product | Page | Hero Media | Key Differentiator |
|---------|------|-----------|-------------------|
| HyperGrid | `hyper-grid.html` | `clip1.mp4` video | Sensor-activated LED gaming floor, 4 game modes |
| Laser Tag | `laser-tag.html` | `laser-tag-1.png` static | Smart vests + scoring, Moments AI integration |
| Laser Spy | `laser-spy.html` | `laser-spy-1.jpg` static | Laser beam maze, 6–9 mo ROI payback, 95% rebook |
| Moments | `moments.html` | `clip2.mp4` video | AI highlight clip system, +40% repeat visits |

---

## Backend

No backend is currently running. A Node.js/Express backend was scaffolded but contact form submissions are front-end only for now. Email: `futureofgamingtech@gmail.com`
