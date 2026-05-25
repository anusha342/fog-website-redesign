# Design System — FOG Technologies Website

> Parameters here are mandatory across every page and component. No exceptions.

---

## Typography

### Typefaces

| Family | Token | Usage |
|---|---|---|
| `ClashDisplay` | `'ClashDisplay'` | All display headings (H1, H2, section titles), product names — always uppercase |
| `GoogleSans` | `'GoogleSans'` | All body copy, UI labels, form fields, captions, nav links, eyebrows |
| `Expansiva` | `'Expansiva'` | Hero FOG text ONLY — decorative, never used for readable content |

---

### Type Scale

Derived from the HyperGrid product page — the canonical reference for this design system. Every value below was extracted from `app/products/hyper-grid/page.module.css` and must be applied consistently across all pages.

```css
:root {
  --fs-display: clamp(48px, 9vw, 110px);   /* Hero title — Expansiva only */
  --fs-h1:      clamp(28px, 4vw, 56px);    /* Section headings — ClashDisplay 700 uppercase */
  --fs-h2:      clamp(20px, 2.5vw, 30px);  /* Sub-section / card group headings — ClashDisplay 700 */
  --fs-h3:      clamp(13px, 1.5vw, 19px);  /* Card / component headings — ClashDisplay 700 */
  --fs-body-lg: clamp(14px, 1.6vw, 18px);  /* Lead paragraph / hero sub-headline — GoogleSans 300 */
  --fs-body:    13px;                        /* Standard body copy — GoogleSans 400 */
  --fs-sm:      11px;                        /* Captions, meta, secondary labels — GoogleSans 500/700 */
  --fs-xs:      clamp(10px, 1vw, 13px);    /* Eyebrows, tags, badges — GoogleSans 500 uppercase */
}
```

---

### Typography by Role

Each role below maps directly to a class pattern used in HyperGrid. All future pages must follow the same spec.

#### Display — Hero title
```
Font:           Expansiva, 700
Size:           clamp(48px, 9vw, 110px)
Line-height:    0.92
Letter-spacing: -1px
Transform:      uppercase
Color:          #ffffff
Usage:          Hero section H1 only — one instance per page
```

#### H1 — Section heading (dominant pattern across all sections)
```
Font:           ClashDisplay, 700
Size:           clamp(28px, 4vw, 56px)
Line-height:    1.05
Letter-spacing: -0.5px
Transform:      uppercase
Color:          #ffffff (dark sections) | #0a0a0a or #131313 (white sections)
Usage:          .whatHeading, .modesV2Title, .momentsTitle, .calcTitle, .speModelTitle, .processTitle
Note:           processTitle uses clamp(26px, 3.6vw, 52px) — acceptable variation for a narrower header band
```

#### H2 — Sub-section / featured card heading
```
Font:           ClashDisplay, 700
Size:           clamp(20px, 2.5vw, 30px)
Line-height:    1.2
Letter-spacing: 0 to -0.5px
Transform:      uppercase
Color:          #ffffff
Usage:          .speAreaTitle (Specs dimensions card title), .speInfoTitle (spec cards)
Special case:   Testimonial quote uses clamp(24px, 2.8vw, 36px), weight 700, line-height 1.2 — editorial licence
Special case:   Mode name (large inactive display text) uses clamp(26px, 3.2vw, 44px), weight 300, line-height 0.95, letter-spacing -1.5px
```

#### H3 — Card / component heading
```
Font:           ClashDisplay, 700
Size:           clamp(13px, 1.5vw, 19px)
Line-height:    1.1 – 1.2
Letter-spacing: 0.2px – 0.3px
Transform:      uppercase
Color:          #ffffff (dark bg) | #0a0a0a (white bg)
Usage:          .boxTitle (step boxes), .momentsCardH (bento cards), .whatCardCaption (polaroid captions)
Note:           momentsCardH uses font-weight 600 — the one permitted 600 case at H3 scale
```

#### Body Lead — Hero sub-headline / section intro
```
Font:           GoogleSans, 300
Size:           clamp(14px, 1.6vw, 18px)
Line-height:    1.6
Letter-spacing: 0.5px
Color:          rgba(255,255,255,0.55) (dark bg) | rgba(0,0,0,0.55) (white bg)
Usage:          .heroSub
```

#### Body — Standard card and section descriptions
```
Font:           GoogleSans, 400
Size:           13px (fixed — body copy never scales fluidly)
Line-height:    1.5 – 1.6
Letter-spacing: 0
Color:          rgba(255,255,255,0.6) (dark) | rgba(19,19,19,0.7) (light)
Usage:          Card body text, spec descriptions, form field text, general prose
```

#### SM — Secondary labels, captions, meta
```
Font:           GoogleSans, 500 (UI context) | GoogleSans, 300 (descriptive context)
Size:           11px (fixed)
Line-height:    1.5
Letter-spacing: 1.5px – 2.5px (uppercase) | 0 (mixed case)
Transform:      uppercase (labels) | none (descriptive)
Color:          rgba(255,255,255,0.5) – rgba(255,255,255,0.7)
Usage:          .momentsCardEyebrow, .momentsStepText, .momentsMadeIn, .speLabel, .boxDesc
Note:           boxDesc uses GoogleSans 300 at clamp(10px, 0.9vw, 12px) — fluid exception for floating overlays
```

#### XS — Section eyebrows (universal pattern)
```
Font:           GoogleSans, 500
Size:           clamp(10px, 1vw, 13px)   [some sections use fixed 11px — acceptable]
Line-height:    1
Letter-spacing: 4px
Transform:      uppercase
Color:          var(--hg-neon-orange)  [orange — always, for every section eyebrow]
Usage:          .heroEyebrow, .modesEyebrow, .momentsEyebrow, .processEyebrow, .calcEyebrow, .speEyebrow
Pattern:        Always reads "0X — Section Name" (e.g. "04 — How It Works")
```

#### XS — Step / badge labels
```
Font:           GoogleSans, 700
Size:           10px – 11px (fixed)
Letter-spacing: 2.5px
Transform:      uppercase
Color:          var(--hg-neon-orange)
Usage:          .boxStep (step boxes), .momentsCardEyebrow (bento card labels)
```

---

### Button Typography

Two button types used across the site. Both have letter-spacing in the 2px range.

#### Primary CTA (solid fill)
```
Font:           ClashDisplay, 600
Size:           15px
Line-height:    1
Letter-spacing: 2px
Transform:      uppercase
Usage:          .hbtn.hbtnSolid — "Get a Proposal", "Get In Touch"
```

#### Ghost / outline (secondary action)
```
Font:           GoogleSans, 500
Size:           12px
Line-height:    1
Letter-spacing: 2px
Transform:      uppercase
Usage:          .processPlayBtn ("Click to Play"), .modesVideoBtn ("Watch Gameplay")
```

---

### Font Weight

| Weight | Usage |
|---|---|
| `300` | Subtext, descriptions, secondary body, hero sub-headline |
| `400` | Standard body copy, nav links, general prose |
| `500` | UI labels, eyebrows, ghost button text, form labels |
| `600` | H3 card headings (momentsCardH only), primary button text (ClashDisplay CTAs) |
| `700` | All ClashDisplay section headings (H1, H2, H3), bold accents, step/badge labels |

> **Rule:** ClashDisplay is always 700 except the `momentsCardH` H3 case (600) and the mode-name display text (300 — decorative large, not a heading). Never use 600 for ClashDisplay section titles.

---

### Letter Spacing

| Context | Value |
|---|---|
| Section eyebrows (GoogleSans, uppercase "01 — Label") | `4px` |
| Primary CTA buttons (ClashDisplay) | `2px` |
| Ghost buttons / UI labels (GoogleSans) | `2px` |
| Step / badge micro-labels (GoogleSans 700 uppercase) | `2.5px` |
| Secondary SM labels (GoogleSans uppercase) | `1.5px` |
| ClashDisplay H1 section headings | `-0.5px` |
| ClashDisplay H2 sub-section headings | `0` to `-0.5px` |
| ClashDisplay hero display (Expansiva equiv) | `-1px` |
| ClashDisplay mode-name display (decorative large) | `-1.5px` |
| Standard body copy (GoogleSans) | `0` |
| Hero sub-headline (GoogleSans body-lg) | `0.5px` |
| Polaroid / frame badge (ClashDisplay uppercase) | `6px` (used once — extreme editorial accent) |

---

### Line Height

| Context | Value |
|---|---|
| Display / hero text (Expansiva) | `0.92` |
| Section headings H1 (ClashDisplay) | `1.05` |
| Sub-section headings H2 (ClashDisplay) | `1.2` |
| Card headings H3 (ClashDisplay) | `1.1` – `1.2` |
| Mode name display (ClashDisplay decorative large) | `0.95` |
| Body lead / hero sub (GoogleSans 300) | `1.6` |
| Standard body copy (GoogleSans) | `1.5` – `1.6` |
| SM captions / meta (GoogleSans) | `1.5` |
| Step / badge labels (GoogleSans XS) | `1` |
| Button / CTA text | `1` |

---

### Colour Roles for Text

| Role | Dark bg value | White bg value |
|---|---|---|
| Section H1/H2 heading | `#ffffff` | `#0a0a0a` |
| Section eyebrow | `var(--hg-neon-orange)` | `var(--hg-neon-orange)` (unchanged) |
| Body lead | `rgba(255,255,255,0.55)` | `rgba(0,0,0,0.55)` |
| Body standard | `rgba(255,255,255,0.6)` | `rgba(19,19,19,0.7)` |
| Secondary / meta | `rgba(255,255,255,0.42)` | `rgba(0,0,0,0.42)` |
| Dimmed / disabled | `rgba(255,255,255,0.28)` | `rgba(0,0,0,0.28)` |
| Step / badge accent | `var(--hg-neon-orange)` | `var(--hg-neon-orange)` (unchanged) |

> **Rule:** Eyebrows and step labels are always orange regardless of section background colour.
