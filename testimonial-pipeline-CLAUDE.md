# Testimonial Pipeline — Phase-wise Implementation Plan

Mirrors the blog pipeline (`pipeline.md`) exactly. Testimonials are stored as JSON objects in S3 under the `testimonials/` prefix, one file per testimonial: `testimonials/{slug}.json`.

---

## Testimonial Entity

All fields map 1:1 from the existing `content/testimonials/*.md` frontmatter + body:

| Field         | Type           | Required | Notes                                                  |
|---------------|----------------|----------|--------------------------------------------------------|
| `slug`        | `string`       | yes      | Auto-generated from `name`, URL-safe, locked on edit   |
| `name`        | `string`       | yes      | Person's full name (e.g. "Rajiv Mehta")                |
| `company`     | `string`       | yes      | Company / venue name (e.g. "Masti Zone India")         |
| `designation` | `string`       | yes      | Job title (e.g. "Operations Director")                 |
| `product`     | `string`       | yes      | FOG product — constrained select (see below)           |
| `location`    | `string`       | yes      | City, Country (e.g. "Bangalore, India")                |
| `avatar`      | `string` (URL) | no       | Headshot — uploaded to S3 assets, or paste URL         |
| `logo`        | `string` (URL) | no       | Company logo — uploaded to S3 assets, or paste URL     |
| `body`        | `string`       | yes      | The testimonial quote text (plain text / textarea)     |

**Product select options** (matches the actual FOG product catalogue):
`HyperGrid` · `Laser Tag` · `Laser Spy` · `Moments AI Break` · `Moments`

---

## Phase 1 — S3 Helper Functions

**File to edit:** `lib/s3.ts`

Add a `testimonialsPrefix()` helper alongside the existing `blogsPrefix()`:

```ts
function testimonialsPrefix() {
  return process.env.S3_TESTIMONIALS_PREFIX || 'testimonials';
}
```

Add four exported functions (parallel to the blog equivalents):

| Function                                           | Behaviour                                                                                  |
|----------------------------------------------------|--------------------------------------------------------------------------------------------|
| `getAllTestimonialsFromS3(): Promise<TestimonialMeta[]>` | `ListObjectsV2` on `testimonials/`, fetch each `.json`, strip `body`, sort by `name` A–Z  |
| `getTestimonialBySlugFromS3(slug): Promise<Testimonial \| null>` | `GetObject` → `testimonials/{slug}.json`, return full object incl. `body`  |
| `putTestimonialToS3(testimonial): Promise<void>`   | `PutObject` → `testimonials/{slug}.json`, body = `JSON.stringify(testimonial, null, 2)`    |
| `deleteTestimonialFromS3(slug): Promise<void>`     | `DeleteObject` → `testimonials/{slug}.json`                                                |
| `testimonialSlugExistsInS3(slug): Promise<boolean>`| `GetObject` try/catch on `testimonials/{slug}.json`, returns `true`/`false`                |

**Types to add to `lib/testimonials.ts`** (or co-locate in `lib/s3.ts`):

```ts
export interface TestimonialMeta {
  slug:        string;
  name:        string;
  company:     string;
  designation: string;
  product:     string;
  location:    string;
  avatar:      string;
  logo:        string;
}

export interface Testimonial extends TestimonialMeta {
  body: string;
}
```

Update `lib/testimonials.ts` → add `getAllTestimonialsFromS3` export so the public pages can switch source from filesystem to S3 in one line change (Phase 6).

---

## Phase 2 — API Routes

### `app/api/admin/testimonials/route.ts`

**GET** — list all testimonials (metadata, no body):
- Calls `getAllTestimonialsFromS3()`, returns JSON array.

**POST** — create new testimonial:
- Required fields: `name`, `slug`, `company`, `designation`, `product`, `location`, `body`
- Block duplicate slug via `testimonialSlugExistsInS3`.
- Call `putTestimonialToS3`.
- Return `{ ok: true, slug }` with status 201.

### `app/api/admin/testimonials/[slug]/route.ts`

**GET** — fetch single testimonial (used by edit form):
- `getTestimonialBySlugFromS3(slug)`, 404 if not found.

**PUT** — update existing testimonial:
- Same required-field validation as POST.
- Slug in URL must match slug in body.
- `existing` check — 404 if not found.
- Call `putTestimonialToS3` (overwrite).
- Return `{ ok: true, slug }`.

**DELETE** — permanently remove from S3:
- Existence check, then `deleteTestimonialFromS3`.
- Return `{ ok: true, deleted: slug }`.

> No separate upload route needed — avatar and logo reuse the existing `/api/admin/upload` endpoint (same S3 assets bucket already wired).

---

## Phase 3 — TestimonialForm Component

**File:** `components/admin/TestimonialForm.tsx`
**CSS Module:** `components/admin/testimonial-form.module.css`
**Styling:** identical light theme as `blog-form.module.css`

### Form Sections

**Section 1 — Person Details** (2-column grid)

| Field         | Element                        | Width      | Notes                                              |
|---------------|--------------------------------|------------|----------------------------------------------------|
| Name          | `<input type="text">`          | full (span2)| Auto-generates slug (create mode), `autoFocus`    |
| Slug          | `<input type="text" readOnly>` | full (span2)| Locked in edit mode; availability indicator on create |
| Designation   | `<input type="text">`          | half       | Placeholder: "Operations Director"                 |
| Company       | `<input type="text">`          | half       | Placeholder: "Masti Zone India"                    |
| Location      | `<input type="text">`          | half       | Placeholder: "Bangalore, India"                    |
| Product       | `<select>` dropdown            | full (span2)| Options: HyperGrid, Laser Tag, Laser Spy, Moments AI Break, Moments |

**Section 2 — Quote**

| Field | Element             | Notes                              |
|-------|---------------------|------------------------------------|
| Body  | `<textarea rows=5>` | The testimonial quote text; required; char count display |

**Section 3 — Avatar** (reuse BlogForm upload zone pattern)

- Hidden `<input type="file">`, click-to-upload zone, upload spinner, preview with change/remove buttons.
- URL fallback `<input type="text">` always visible below.
- POST to `/api/admin/upload` → sets `values.avatar`.
- Allowed: JPG, PNG, WebP · max 4 MB.

**Section 4 — Company Logo** (same upload zone pattern)

- Identical to Section 3 but drives `values.logo`.

### Form State

```ts
interface FormValues {
  name:        string;
  slug:        string;
  company:     string;
  designation: string;
  product:     string;
  location:    string;
  avatar:      string;   // URL
  logo:        string;   // URL
  body:        string;
}
```

### Slug logic

Same as `BlogForm`:
- `toSlug(name)` → lowercase, spaces → hyphens, strip non-alphanumeric.
- Auto-generated from `name` in create mode until user manually edits slug field.
- Debounced 500 ms check against `GET /api/admin/testimonials/{slug}`.
- Status indicator: Checking… / ✓ Available / ✗ Taken.
- In edit mode: slug field is `readOnly`.

### Validation (client + server)

Required: `name`, `slug`, `company`, `designation`, `product`, `location`, `body`.
On error: scroll first invalid field into view.

### Props

```ts
export interface Props {
  mode:                 'create' | 'edit';
  initialTestimonial?:  Testimonial;
}
```

On save success → `router.push('/admin/testimonials')`.

---

## Phase 4 — Admin Pages

### `app/admin/testimonials/page.tsx` — List page

Client Component (same shape as `app/admin/blogs/page.tsx`).

- Fetches `GET /api/admin/testimonials` on mount.
- Table columns: **Name**, **Company**, **Product**, **Actions** (✏ edit / 🗑 delete).
- Delete uses shared `<ConfirmDeleteModal>` — the `title` prop receives the testimonial `name`.
- Top bar: `← Dashboard` back link, `h1` "All Testimonials", `+ New Testimonial` button → `/admin/testimonials/new`.
- Footer: count string + "View testimonials on site ↗" link to `/`.

**CSS Module:** `app/admin/testimonials/testimonials.module.css` — copy `blogs.module.css` structure; rename classes where needed.

---

### `app/admin/testimonials/new/page.tsx` — Create page

Server Component (no auth check needed — middleware covers it).

```tsx
import TestimonialForm from '@/components/admin/TestimonialForm';
export default function NewTestimonialPage() {
  return <TestimonialForm mode="create" />;
}
```

---

### `app/admin/testimonials/[slug]/edit/page.tsx` — Edit page

Server Component — fetches testimonial server-side and passes as `initialTestimonial`.

```tsx
import { getTestimonialBySlugFromS3 } from '@/lib/s3';
import { notFound } from 'next/navigation';
import TestimonialForm from '@/components/admin/TestimonialForm';

export default async function EditTestimonialPage({ params }) {
  const { slug } = await params;
  const testimonial = await getTestimonialBySlugFromS3(slug);
  if (!testimonial) notFound();
  return <TestimonialForm mode="edit" initialTestimonial={testimonial} />;
}
```

---

## Phase 5 — Enable Dashboard Card

**File:** `app/admin/dashboard/page.tsx`

Replace the disabled `<div>` testimonials card with a live `<Link>`:

```tsx
// Before (disabled):
<div className={`${styles.card} ${styles.cardDisabled}`}>
  <span className={styles.cardIcon}>&#9733;</span>
  <span className={styles.cardLabel}>Testimonials</span>
  <span className={styles.cardDesc}>Coming in a future phase</span>
  <span className={styles.cardBadge}>Soon</span>
</div>

// After (enabled):
<Link href="/admin/testimonials" className={styles.card}>
  <span className={styles.cardIcon}>&#9733;</span>
  <span className={styles.cardLabel}>Testimonials</span>
  <span className={styles.cardDesc}>Create, edit &amp; delete testimonials</span>
  <span className={styles.cardArrow}>&#x2192;</span>
</Link>
```

---

## Phase 6 — Public Site Integration

Update `lib/testimonials.ts` so the public testimonials carousel and any SSG pages read from S3 instead of the local `content/testimonials/` filesystem directory.

```ts
// lib/testimonials.ts — replace getAllTestimonials with S3 source
import { getAllTestimonialsFromS3 } from './s3';

export async function getAllTestimonials(): Promise<Testimonial[]> {
  return getAllTestimonialsFromS3();
}
```

Pages that consume testimonials and need updating:

| File                                      | Change needed                                              |
|-------------------------------------------|------------------------------------------------------------|
| `app/HomeClient.tsx`                      | Fetch `/api/testimonials` (new public route) or pass as prop from server component |
| Any future `/testimonials` page           | Use `await getAllTestimonials()` from updated lib           |

Add a public read-only API route **`app/api/testimonials/route.ts`**:
- No auth required.
- `GET` → `getAllTestimonialsFromS3()`, returns array.
- Used by `HomeClient.tsx` to populate the testimonials carousel.

> **ISR note:** If testimonial pages are statically generated, add `revalidate = 60` to relevant Server Components so S3 changes propagate within 60 seconds, matching the blog pipeline pattern.

---

## File Checklist

```
lib/s3.ts                                          ← add testimonial helpers + TestimonialMeta type
lib/testimonials.ts                                ← add S3-backed getAllTestimonials (Phase 6)

app/api/admin/testimonials/route.ts                ← GET (list) + POST (create)
app/api/admin/testimonials/[slug]/route.ts         ← GET + PUT + DELETE
app/api/testimonials/route.ts                      ← public GET (Phase 6)

components/admin/TestimonialForm.tsx               ← create/edit form
components/admin/testimonial-form.module.css       ← light-theme styles

app/admin/testimonials/page.tsx                    ← list page
app/admin/testimonials/testimonials.module.css     ← list page styles
app/admin/testimonials/new/page.tsx                ← create page
app/admin/testimonials/[slug]/edit/page.tsx        ← edit page

app/admin/dashboard/page.tsx                       ← enable testimonials card (Phase 5)
```

---

## Implementation Order

1. **Phase 1** — S3 helpers (no UI, safe to merge alone)
2. **Phase 2** — API routes (testable via curl/Postman before any UI)
3. **Phase 3** — `TestimonialForm` component
4. **Phase 4** — Admin pages (list + new + edit)
5. **Phase 5** — Enable dashboard card
6. **Phase 6** — Public site reads from S3 (deploy last; requires all above to be live)

---

## Progress

| Phase | Description                        | Status      | Session    |
|-------|------------------------------------|-------------|------------|
| 1     | S3 helpers + types                 | ✅ Complete  | 2026-05-23 |
| 2     | API routes (admin CRUD)            | ⏳ Pending   | —          |
| 3     | `TestimonialForm` component        | ⏳ Pending   | —          |
| 4     | Admin pages (list / new / edit)    | ⏳ Pending   | —          |
| 5     | Enable dashboard card              | ⏳ Pending   | —          |
| 6     | Public site integration (S3 read)  | ⏳ Pending   | —          |

### Phase 1 — Done (2026-05-23)

**Files changed:**
- `lib/testimonials.ts` — split `Testimonial` into `TestimonialMeta` (meta-only) + `Testimonial extends TestimonialMeta` (adds `body`); `rating` kept in both for backwards-compat with `TestimonialCard.tsx` star display
- `lib/s3.ts` — added `testimonialsPrefix()`, `testimonialsAssetsPrefix()` helpers; exported `getTestimonialAssetUrl`, `getAllTestimonialsFromS3`, `getTestimonialBySlugFromS3`, `putTestimonialToS3`, `deleteTestimonialFromS3`, `testimonialSlugExistsInS3`; exported `testimonialsAssetsPrefix` for the upload route (Phase 2)

**S3 key layout:**
```
testimonials/{slug}.json          ← full Testimonial object (incl. body)
testimonials/assets/{uuid}-{name} ← avatar / logo uploads (Phase 3)
```
