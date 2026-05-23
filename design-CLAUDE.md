# Design System — FOG Technologies Website

> Parameters here are mandatory across every page and component. No exceptions.

---

## Typography

### Typefaces

| Family | Token | Usage |
|---|---|---|
| `ClashDisplay` | `'ClashDisplay'` | All display headings (H1, H2, section titles), product names — always uppercase |
| `GoogleSans` | `'GoogleSans'` | All body copy, UI labels, form fields, captions, nav links |
| `Expansiva` | `'Expansiva'` | Hero FOG text ONLY — decorative, never used for readable content |

---

### Type Scale

> **[TO BE FINALIZED WITH CLIENT]**
>
> Once confirmed, these 8 variables will be added to `:root` in `globals.css` and every hardcoded `font-size` across all `.module.css` files will be replaced with the corresponding variable.

```css
:root {
  --fs-display: ; /* Hero / oversized display text */
  --fs-h1:      ; /* Page-level heading */
  --fs-h2:      ; /* Section heading */
  --fs-h3:      ; /* Card / sub-section heading */
  --fs-body-lg: ; /* Lead paragraph / large body */
  --fs-body:    ; /* Standard body copy */
  --fs-sm:      ; /* Captions, meta, secondary labels */
  --fs-xs:      ; /* Eyebrows, badges, tags, uppercase micro-labels */
}
```

All values will use `clamp(min, fluid, max)` for responsive fluid scaling.

---

### Font Weight

| Weight | Usage |
|---|---|
| `300` | Subtext, descriptions, secondary body |
| `400` | Standard body copy, nav links |
| `500` | UI labels, button text, form text |
| `600` | Card titles, strong body emphasis |
| `700` | All ClashDisplay headings, bold accents |

---

### Letter Spacing

| Context | Value |
|---|---|
| ClashDisplay headings | `-0.5px` to `-1.5px` (tighter at larger sizes) |
| Uppercase micro-labels (eyebrows, tags) | `2px` to `5px` |
| Button / CTA text | `1.5px` to `2px` |
| Standard body copy | `0` |

---

### Line Height

| Context | Value |
|---|---|
| Display / hero text | `0.88` – `1.05` |
| Section headings | `1.01` – `1.1` |
| Body copy | `1.6` – `1.7` |
| UI labels / buttons | `1` |
| Captions / meta | `1.5` – `1.6` |
