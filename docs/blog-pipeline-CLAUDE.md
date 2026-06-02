# Admin Panel Pipeline — Blog & Testimonials (FOG Technologies)

## Storage Architecture
- **Blogs** stored as `blogs/{slug}.json` in S3 — fields: title, slug, date, excerpt, author, coverImage (S3 URL), category, tags, readTime, bodyHtml
- **Images** stored in S3 `blogs/assets/` folder — publicly readable via bucket policy
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
| 1 | `app/api/admin/blogs/[slug]/route.ts` ✅ | GET (single post for edit form) + DELETE (removes `blogs/{slug}.json` from S3) |
| 2 | `components/admin/ConfirmDeleteModal.tsx` ✅ | Animated modal: post title + slug preview, "Delete permanently" / "Cancel", Escape key closes, backdrop click closes |
| 3 | `components/admin/confirm-delete-modal.module.css` ✅ | Modal styles — backdrop blur, slide-up card animation, red delete button |
| 4 | `app/admin/blogs/page.tsx` ✅ | Delete icon enabled → opens modal → on confirm calls DELETE API → removes from local state (no refetch) |

---

## Phase 4a — Blog Form Shell + Metadata Fields

**Goal:** Create / Edit form with all metadata inputs and slug auto-generation.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/admin/blogs/new/page.tsx` ✅ | Create route — renders BlogForm with empty default values |
| 2 | `app/admin/blogs/[slug]/edit/page.tsx` ✅ | Edit route — server component that fetches post from S3 and passes to BlogForm |
| 3 | `components/admin/BlogForm.tsx` ✅ | Full form: Title, Slug (auto-gen + editable, locked in edit mode), Date, Read Time, Author, Category, Tags, Excerpt, Cover Image (URL input), Body (textarea placeholder) |
| 4 | `components/admin/blog-form.module.css` ✅ | Two-column responsive form layout, input error states, slug status indicator, phase banners |
| 5 | Slug auto-generation ✅ | Generates from title on each keystroke; stops auto-gen once user manually edits slug field |
| 6 | Slug collision check ✅ | 500ms debounce → GET `/api/admin/blogs/{slug}` → shows Available / Taken / Checking indicator |
| 7 | Client validation ✅ | All required fields highlighted on submit; scrolls to first error; blocks submit if slug is taken |

---

## Phase 4b — Cover Image Upload to S3

**Goal:** File picker → upload to S3 `assets/` → store URL in form state.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/api/admin/upload/route.ts` ✅ | Validates type (JPG/PNG/WebP/GIF) and size (max 4 MB), generates `{uuid}-{sanitized-name}` key, uploads to S3 `assets/`, returns public URL |
| 2 | `components/admin/BlogForm.tsx` ✅ | Cover image section replaced: click-to-upload zone → immediate API upload → spinner during upload → thumbnail preview with Change / Remove buttons → URL fallback input always visible |
| 3 | `components/admin/blog-form.module.css` ✅ | Upload zone (dashed border, hover highlight), uploading spinner, uploaded preview bar, Change/Remove buttons, URL fallback section |

---

## Phase 4c — Rich Text Body Editor

**Goal:** Tiptap editor for blog body with image insertion.

| # | File | Purpose |
|---|------|---------|
| 1 | `components/admin/RichTextEditor.tsx` ✅ | Tiptap editor with toolbar: Bold, Italic, H2, H3, Bullet List, Ordered List, Blockquote, Code Block, HR, Insert Image; active-state highlights on toolbar buttons; word count footer |
| 2 | Image in editor ✅ | Toolbar camera button → hidden file input → POST `/api/admin/upload` → `editor.commands.setImage()` inserts at cursor; spinner on button during upload; inline error banner on failure |
| 3 | `components/admin/rich-text-editor.module.css` ✅ | Toolbar with divider groups, active button highlight (orange border), full prose styles for H2/H3/p/ul/ol/blockquote/pre/code/hr/img inside `.proseMirror`, orange focus ring on editor wrap, word count footer |
| 4 | `components/admin/BlogForm.tsx` ✅ | Body section: textarea + Phase 4c banner replaced with `<RichTextEditor>` wired to `values.bodyHtml` |

**Packages:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`

---

## Phase 4d — Save, Validation & Full Flow

**Goal:** Wire form submit to S3 write. End-to-end test: create post → appears on /blog within 60s.

| # | File | Purpose |
|---|------|---------|
| 1 | `app/api/admin/blogs/route.ts` (POST) ✅ | Server-validates all required fields; blocks duplicate slugs via `slugExistsInS3`; calls `putPostToS3`; returns 201 |
| 2 | `app/api/admin/blogs/[slug]/route.ts` (PUT) ✅ | Server-validates fields; checks slug in body matches URL param; verifies post exists before overwriting; calls `putPostToS3` |
| 3 | `components/admin/BlogForm.tsx` ✅ | `handleSubmit` made async; builds typed payload (tags split from comma string, readTime cast to number); calls POST or PUT; shows spinner + disables buttons during save; on success redirects to `/admin/blogs`; on error shows dismissible save-error banner |
| 4 | `components/admin/blog-form.module.css` ✅ | Save error banner styles, spinning indicator inside Save button |

---

---

## Phase 5 — Admin UX Hardening

**Goal:** Remove site navbar from admin pages, add logout-guarded "Back to Home", intercept URL-bar navigation away from admin.

| # | File | Purpose |
|---|------|---------|
| 1 | `components/ClientLayout.tsx` ✅ | Client component wrapping root layout — hides `<Navbar>` and `<Footer>` on all `/admin/*` routes |
| 2 | `app/layout.tsx` ✅ | Updated to use `ClientLayout` instead of rendering Navbar/Footer directly |
| 3 | `proxy.ts` ✅ | (a) Protects `/admin/*` routes — redirects unauthenticated users to `/admin`. (b) Intercepts logged-in admins navigating to any public route → redirects to `/admin/logout-confirm?redirect=<path>` (Next.js 16 renamed middleware → proxy) |
| 4 | `components/admin/LogoutConfirmModal.tsx` ✅ | Reusable modal: "You'll be logged out" warning with Cancel / Proceed buttons |
| 5 | `components/admin/logout-confirm-modal.module.css` ✅ | Light-theme modal styles — white card, backdrop blur, orange Proceed button |
| 6 | `app/admin/logout-confirm/page.tsx` ✅ | Full-page confirmation shown when middleware redirects; Proceed → logout + navigate to original destination; Cancel → `/admin/dashboard` |
| 7 | `components/admin/BackToHomeButton.tsx` ✅ | Client component rendered in dashboard footer — opens LogoutConfirmModal; on Proceed calls logout API then pushes to `/` |
| 8 | `app/admin/dashboard/page.tsx` ✅ | Added BackToHomeButton; commented out MigrateButton section (migration complete) |
| 9 | All admin CSS files ✅ | Rethemed to light mode (white cards, `#f0f2f5` page bg, `#111827` text, `#F05023` orange accents, `#d1d5db` borders) — `dashboard.module.css`, `blogs.module.css`, `admin.module.css`, `blog-form.module.css`, `rich-text-editor.module.css` |
| 10 | `blog-form.module.css` ✅ | Top padding reduced from 96px back to 32px (navbar no longer rendered on admin pages) |

---

## Progress Tracker

| Phase | Status | Completed |
|-------|--------|-----------|
| Phase 1 — Auth with OTP | ✅ Complete | 2026-05-22 |
| Phase 2 — Admin Shell + Blog List | ✅ Complete | 2026-05-22 |
| Phase 3 — Delete Blog | ✅ Complete | 2026-05-22 |
| Phase 4a — Form Shell + Metadata | ✅ Complete | 2026-05-22 |
| Phase 4b — Cover Image Upload | ✅ Complete | 2026-05-22 |
| Phase 4c — Rich Text Editor | ✅ Complete | 2026-05-22 |
| Phase 4d — Save + Validation | ✅ Complete | 2026-05-22 |
| Phase 5 — Admin UX Hardening | ✅ Complete | 2026-05-23 |
