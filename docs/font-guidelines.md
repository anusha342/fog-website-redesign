# Font Guidelines — FOG Technologies Website

> These rules are mandatory across every page and component. No exceptions unless explicitly noted.

---

## Font Families

| Role       | Family          | Fallback Stack          | Source        | Case          |
|------------|-----------------|-------------------------|---------------|---------------|
| Display    | `ClashDisplay`  | Arial, sans-serif       | Local (`/public/fonts/`) | UPPERCASE always |
| Body / UI  | `GoogleSans`    | Helvetica, sans-serif   | Local (`/public/fonts/`) | Sentence case |
| Hero Deco  | `Expansiva`     | Arial, sans-serif       | Local (`/public/fonts/`) | UPPERCASE — decorative hero FOG text ONLY |

> **Rule:** `ClashDisplay` is used exclusively for all headings (H1–H4), section titles, and product names — always uppercase.
> **Rule:** `GoogleSans` is used for all other text — descriptions, body copy, buttons, nav links, form fields, labels, captions, eyebrows — always sentence case.
> **Rule:** `Expansiva` is reserved for the decorative hero FOG text on the home page only. Never use it for readable content.

---

## Type Scale

| Token        | Element              | Font Family     | Size (rem)  | Size (px equiv) | Weight | Line Height | Letter Spacing | Word Spacing | CSS Variable        |
|--------------|----------------------|-----------------|-------------|-----------------|--------|-------------|----------------|--------------|---------------------|
| `hero`       | Product page hero H1 | `ClashDisplay`  | 6.25rem     | 100px (fixed)   | 700    | 0.92        | 0.1px          | 2px          | `--fs-hero`         |
| `heading-1`  | `<h1>` section heads | `ClashDisplay`  | 5rem        | 80px            | 700    | 1.05        | 0.1px          | 2px          | `--fs-heading-1`    |
| `heading-2`  | `<h2>` sub-sections  | `ClashDisplay`  | 2.75rem     | 44px            | 700    | 1.2         | 0.1px          | 2px          | `--fs-heading-2`    |
| `heading-3`  | `<h3>` card headings | `ClashDisplay`  | 2.25rem     | 36px            | 700    | 1.1         | 0.1px          | 2px          | `--fs-heading-3`    |
| `heading-4`  | `<h4>` minor labels  | `ClashDisplay`  | 1.375rem    | 22px            | 700    | 1.2         | 0.1px          | 2px          | `--fs-heading-4`    |
| `body-p1`    | Lead / hero sub-text | `GoogleSans`    | 1.25rem     | 20px            | 300    | 1.6         | 0.1px          | 2px          | `--fs-body-p1`      |
| `body-p2`    | Section intros       | `GoogleSans`    | 1.125rem    | 18px            | 400    | 1.6         | 0.1px          | 2px          | `--fs-body-p2`      |
| `body-p3`    | Standard body copy   | `GoogleSans`    | 1rem        | 16px            | 400    | 1.5         | 0.1px          | 2px          | `--fs-body-p3`      |
| `body-p4`    | Captions, meta, tags | `GoogleSans`    | 0.875rem    | 14px            | 400    | 1.5         | 0.1px          | 2px          | `--fs-body-p4`      |

> **Minimum body size:** `0.875rem` (14px). Never go smaller for readable content.
> **Hero token** applies to product page hero H1 only (HyperGrid, Laser Tag, Laser Spy, Moments, etc.). Home page decorative hero uses `Expansiva` — not this token.

---

## Weights in Use

| Weight Name | Value | Used In                                                            |
|-------------|-------|--------------------------------------------------------------------|
| Light       | 300   | Subtext, descriptions, secondary body, hero sub-headline (P1)     |
| Regular     | 400   | Standard body copy (P2–P4), nav links, general prose              |
| Medium      | 500   | UI labels, eyebrows, ghost button text, form labels               |
| Semi-bold   | 600   | H3 card headings (`momentsCardH` only), primary CTA button text   |
| Bold        | 700   | All ClashDisplay headings (H1–H4), bold accents, step/badge labels |

> **Rule:** `ClashDisplay` is always weight `700` except:
> - `momentsCardH` H3 case → `600`
> - Decorative large mode-name display text → `300` (not a heading, purely visual)
> Never use `600` for ClashDisplay section titles.

---

## Spacing Rules

| Property         | Value   | Applies To                     |
|------------------|---------|--------------------------------|
| `letter-spacing` | `0.1px` | All text (universal default)   |
| `word-spacing`   | `2px`   | All text (universal default)   |

> These are the global defaults. Eyebrow labels (uppercase `GoogleSans`) may use larger `letter-spacing` (up to `4px`) where the design calls for it — this is a documented exception, not a rule change.

---

## Border Radius

| Element                                        | Value  |
|------------------------------------------------|--------|
| Buttons                                        | `0px`  |
| Cards                                          | `0px`  |
| Quadrilateral divs, containers, form fields    | `0px`  |
| Any other UI element                           | `0px`  |

> **Rule:** Border radius is always `0px` across the entire site. No exceptions.

---

## Button Typography

| Button Type      | Font Family    | Size    | Weight | Letter Spacing | Word Spacing | Transform  |
|------------------|----------------|---------|--------|----------------|--------------|------------|
| Primary CTA      | `ClashDisplay` | 15px    | 600    | 2px            | 2px          | uppercase  |
| Ghost / outline  | `GoogleSans`   | 12px    | 500    | 2px            | 2px          | uppercase  |

> **Note:** Button text is one of the few places `GoogleSans` uses uppercase — only for ghost/outline secondary actions.
> Primary CTA uses `ClashDisplay` at weight `600` (the one sanctioned case for ClashDisplay below `700` in a UI role).

---

## Colour Roles for Text

| Role                   | Dark bg value                | White bg value               |
|------------------------|------------------------------|------------------------------|
| H1–H4 headings         | `#ffffff`                    | `#0a0a0a`                    |
| Section eyebrow        | `var(--hg-neon-orange)`      | `var(--hg-neon-orange)`      |
| Body lead (P1)         | `rgba(255,255,255,0.55)`     | `rgba(0,0,0,0.55)`           |
| Body standard (P2–P3)  | `rgba(255,255,255,0.6)`      | `rgba(19,19,19,0.7)`         |
| Captions / meta (P4)   | `rgba(255,255,255,0.5)`      | `rgba(0,0,0,0.42)`           |
| Dimmed / disabled      | `rgba(255,255,255,0.28)`     | `rgba(0,0,0,0.28)`           |
| Step / badge accent    | `var(--hg-neon-orange)`      | `var(--hg-neon-orange)`      |

> **Rule:** Eyebrows and step labels are always orange regardless of section background colour.

---

## CSS Variable Index

```css
--fs-hero          /* 6.25rem — product page hero H1 (100px fixed) */
--fs-heading-1     /* 5rem     — ClashDisplay 700 uppercase */
--fs-heading-2     /* 2.75rem  — ClashDisplay 700 uppercase */
--fs-heading-3     /* 2.25rem  — ClashDisplay 700 uppercase */
--fs-heading-4     /* 1.375rem — ClashDisplay 700 uppercase */
--fs-body-p1       /* 1.25rem  — GoogleSans 300 sentence case */
--fs-body-p2       /* 1.125rem — GoogleSans 400 sentence case */
--fs-body-p3       /* 1rem     — GoogleSans 400 sentence case */
--fs-body-p4       /* 0.875rem — GoogleSans 400 sentence case */
```

---

## Usage Rules

- `ClashDisplay` is **only** used for headings (H1–H4), section titles, and product names — always uppercase.
- `GoogleSans` is used for **all other text** — descriptions, body copy, captions, buttons, nav, forms — always sentence case.
- `Expansiva` is used **only** for the home page decorative FOG hero text. Never elsewhere.
- Minimum readable text size is `0.875rem` (14px / `--fs-body-p4`).
- `border-radius` is **always `0px`** — buttons, cards, containers, form fields, everything.
- Global `letter-spacing: 0.1px` and `word-spacing: 2px` apply to all text.
- Font weights must follow the weight table exactly — do not invent intermediate values.
- Never mix `ClashDisplay` and `GoogleSans` within the same line of text.
- Line heights come from the values in the Type Scale table above and must not be overridden arbitrarily.

---

## Mobile Responsive Typography

> **Status: TBD — rules to be defined in a future session.**

This section will define:
- At which breakpoints (e.g. `768px`, `480px`) the type scale steps down
- Which tokens switch from fluid (`clamp(...)`) to fixed `px` / `rem` values on mobile
- Whether heading levels collapse (e.g. H1 → H2 scale on `< 768px`)
- Minimum tap-target sizes for button text
- Any mobile-specific `letter-spacing` or `word-spacing` adjustments

*Do not implement any mobile font overrides until this section is filled in.*
