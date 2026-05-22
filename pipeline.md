# Admin Panel Pipeline — Blog & Testimonials (FOG Technologies)

## Storage Architecture
- **Blogs** stored as `blogs/{slug}.json` in S3 — fields: title, slug, date, excerpt, author, coverImage (S3 URL), category, tags, readTime, bodyHtml
- **Images** stored in S3 `assets/` folder — publicly readable via bucket policy
- **Public blog pages** read from S3 with ISR (`revalidate = 60`) — no redeploy needed when content changes
- **Auth** uses stateless JWT cookies (OTP token short-lived 10min, admin session 7 days)

---

## Phase 1 — Auth with OTP

**Goal:** Secure the `/admin` route behind email allowlist + Resend OTP + JWT session cookie.

| # | File | Purpose |
|---|------|---------|
| 1 | `middleware.ts` | Guards all `/admin/*` routes; redirects to `/admin` if no valid JWT cookie |
| 2 | `app/admin/page.tsx` | Email entry form |
| 3 | `app/admin/verify/page.tsx` | OTP entry form |
| 4 | `app/admin/admin.module.css` | Shared admin UI styles |
| 5 | `app/api/admin/send-otp/route.ts` | Validates email vs ADMIN_EMAILS, generates OTP, stores in signed JWT cookie, sends via Resend |
| 6 | `app/api/admin/verify-otp/route.ts` | Checks OTP cookie, issues long-lived admin_token cookie |
| 7 | `app/api/admin/logout/route.ts` | Clears admin_token cookie |

**Env vars required:**
```
ADMIN_EMAILS=you@example.com
ADMIN_JWT_SECRET=<32-char random hex>
RESEND_API_KEY=<already set>
```

---

## Phase 2 — Admin Shell + Blog List (Read)

**Goal:** Admin landing page + blog list reading live from S3.

| # | File | Purpose |
|---|------|---------|
| 1 | `lib/s3.ts` ✅ | S3 client + all CRUD helpers (getAllPostsFromS3, getPostBySlugFromS3, putPostToS3, deletePostFromS3, slugExistsInS3) |
| 2 | `next.config.ts` ✅ | Added S3 hostname (`*.s3.ap-south-1.amazonaws.com`) to next/image allowed patterns |
| 3 | `app/api/admin/blogs/route.ts` (GET) ✅ | Lists all `blogs/*.json` from S3, returns metadata array |
| 4 | `app/api/admin/migrate/route.ts` (POST) ✅ | One-time migration: reads `.md` files, converts to HTML JSON, uploads to S3 |
| 5 | `app/admin/dashboard/page.tsx` ✅ | Landing: Blogs / Testimonials (greyed) / Migrate button / Logout / Home |
| 6 | `app/admin/dashboard/MigrateButton.tsx` ✅ | Client component for one-time migration trigger |
| 7 | `app/admin/dashboard/dashboard.module.css` ✅ | Dashboard styles |
| 8 | `app/admin/blogs/page.tsx` ✅ | Blog list table with Edit / Delete icons (delete disabled until Phase 3) |
| 9 | `app/admin/blogs/blogs.module.css` ✅ | Blog list styles |
| 10 | `app/blog/page.tsx` ✅ | Switched to `getAllPostsFromS3()` + `revalidate = 60` |
| 11 | `app/blog/[slug]/page.tsx` ✅ | Switched to `getPostBySlugFromS3()` + ISR (`revalidate = 60`, `dynamicParams = true`) |

**Env vars required:**
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET_NAME=
S3_BLOGS_PREFIX=blogs
S3_ASSETS_PREFIX=assets
```

**Packages:** `@aws-sdk/client-s3`

---

## Phase 3 — Delete Blog

**Goal:** Delete a blog post from S3 with a confirmation popup.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/api/admin/blogs/[slug]/route.ts` (DELETE) | Auth-checks JWT, calls `s3.DeleteObject` on `blogs/{slug}.json` |
| 2 | `components/admin/ConfirmDeleteModal.tsx` | Warning popup: Proceed / Cancel |
| 3 | `app/admin/blogs/page.tsx` (update) | Wire delete icon → modal → API → remove from list state |

---

## Phase 4a — Blog Form Shell + Metadata Fields

**Goal:** Create / Edit form with all metadata inputs and slug auto-generation.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/admin/blogs/new/page.tsx` | Create route — renders BlogForm with empty values |
| 2 | `app/admin/blogs/[slug]/edit/page.tsx` | Edit route — fetches post from S3, passes as initial values |
| 3 | `app/api/admin/blogs/[slug]/route.ts` (GET) | Returns single post JSON for pre-filling edit form |
| 4 | `components/admin/BlogForm.tsx` | Form: Title, Slug (auto + editable), Date, Author, Category, Tags, ReadTime, Excerpt |
| 5 | Slug collision check | On slug blur → GET `/api/admin/blogs/{slug}` → warn if already exists |

---

## Phase 4b — Cover Image Upload to S3

**Goal:** File picker → upload to S3 `assets/` → store URL in form state.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/api/admin/upload/route.ts` | Accepts multipart file, streams to S3 `assets/{uuid}-{name}`, returns public S3 URL |
| 2 | `components/admin/BlogForm.tsx` (update) | Cover image field: pick file → call upload API → show thumbnail + store URL |

---

## Phase 4c — Rich Text Body Editor

**Goal:** Tiptap editor for blog body with image insertion.

| # | File | Purpose |
|---|------|---------|
| 1 | `components/admin/RichTextEditor.tsx` | Tiptap editor with toolbar: Bold, Italic, H2, H3, Bullet list, Ordered list, Blockquote, Code, Insert Image |
| 2 | Image in editor | Toolbar "Image" → file picker → upload API → insert as `<img>` at cursor |
| 3 | `components/admin/BlogForm.tsx` (update) | Replace body textarea with `<RichTextEditor>` |

**Packages:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`

---

## Phase 4d — Save, Validation & Full Flow

**Goal:** Wire form submit to S3 write. End-to-end test: create post → appears on /blog within 60s.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/api/admin/blogs/route.ts` (POST) | Create: validate all fields, write `blogs/{slug}.json` to S3 |
| 2 | `app/api/admin/blogs/[slug]/route.ts` (PUT) | Update: validate, overwrite JSON in S3 |
| 3 | Client validation | Highlight empty required fields before API call |
| 4 | On success | Redirect to `/admin/blogs` — list reflects updated state |

---

## Progress Tracker

| Phase | Status | Completed |
|-------|--------|-----------|
| Phase 1 — Auth with OTP | ✅ Complete | 2026-05-22 |
| Phase 2 — Admin Shell + Blog List | ✅ Complete | 2026-05-22 |
| Phase 3 — Delete Blog | ⏳ Pending | — |
| Phase 4a — Form Shell + Metadata | ⏳ Pending | — |
| Phase 4b — Cover Image Upload | ⏳ Pending | — |
| Phase 4c — Rich Text Editor | ⏳ Pending | — |
| Phase 4d — Save + Validation | ⏳ Pending | — |
