'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/blog';
import RichTextEditor from './RichTextEditor';
import styles from './blog-form.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormValues {
  title:      string;
  slug:       string;
  date:       string;
  author:     string;
  category:   string;
  tags:       string; // comma-separated; converted to string[] on save
  readTime:   string;
  excerpt:    string;
  coverImage: string; // URL; file upload wired in Phase 4b
  bodyHtml:   string; // raw HTML; rich-text editor wired in Phase 4c
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;
type SlugStatus  = 'idle' | 'checking' | 'available' | 'taken';

export interface Props {
  mode:         'create' | 'edit';
  initialPost?: Post & { bodyHtml?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function emptyForm(): FormValues {
  return {
    title:      '',
    slug:       '',
    date:       today(),
    author:     'FOG Technologies',
    category:   'Default',
    tags:       '',
    readTime:   '5',
    excerpt:    '',
    coverImage: '',
    bodyHtml:   '',
  };
}

function postToForm(post: Post & { bodyHtml?: string }): FormValues {
  return {
    title:      post.title,
    slug:       post.slug,
    date:       post.date,
    author:     post.author,
    category:   post.category,
    tags:       Array.isArray(post.tags) ? post.tags.join(', ') : '',
    readTime:   String(post.readTime ?? 5),
    excerpt:    post.excerpt,
    coverImage: post.coverImage ?? '',
    bodyHtml:   post.bodyHtml ?? post.contentHtml ?? '',
  };
}

const REQUIRED_FIELDS: (keyof FormValues)[] = [
  'title', 'slug', 'date', 'author', 'category', 'readTime', 'excerpt',
];

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of REQUIRED_FIELDS) {
    if (!values[key].trim()) errors[key] = 'This field is required.';
  }
  const rt = Number(values.readTime);
  if (isNaN(rt) || rt < 1) errors.readTime = 'Must be a number >= 1.';
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BlogForm({ mode, initialPost }: Props) {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>(
    () => initialPost ? postToForm(initialPost) : emptyForm()
  );
  const [errors,     setErrors]     = useState<FieldErrors>({});
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Cover image upload state ──────────────────────────────────────────────
  type UploadStatus = 'idle' | 'uploading' | 'error';
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError,  setUploadError]  = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-generate slug from title (create mode only) ─────────────────────
  useEffect(() => {
    if (slugManuallyEdited) return;
    setValues((prev) => ({ ...prev, slug: toSlug(prev.title) }));
  }, [values.title, slugManuallyEdited]);

  // ── Slug collision check ──────────────────────────────────────────────────
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || mode === 'edit') return;
    setSlugStatus('checking');
    try {
      const res = await fetch(`/api/admin/blogs/${encodeURIComponent(slug)}`);
      setSlugStatus(res.ok ? 'taken' : 'available');
    } catch {
      setSlugStatus('idle');
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' || !values.slug) { setSlugStatus('idle'); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkSlug(values.slug), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [values.slug, mode, checkSlug]);

  // ── Field change ──────────────────────────────────────────────────────────
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name as keyof FormValues]; return n; });
    }
    if (name === 'slug') setSlugManuallyEdited(true);
  }

  // ── Cover image file upload ───────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
    if (!file) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Only JPG, PNG, WebP and GIF images are allowed.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File must be smaller than 4 MB.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError('');

    try {
      const body = new FormData();
      body.append('file', file);
      const res  = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed.');
        setUploadStatus('error');
        return;
      }

      setValues((prev) => ({ ...prev, coverImage: data.url }));
      setUploadStatus('idle');
    } catch {
      setUploadError('Network error during upload.');
      setUploadStatus('error');
    }
  }

  function removeCoverImage() {
    setValues((prev) => ({ ...prev, coverImage: '' }));
    setUploadStatus('idle');
    setUploadError('');
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');

    // Client-side field validation
    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstKey = Object.keys(fieldErrors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (slugStatus === 'taken') {
      setErrors((prev) => ({ ...prev, slug: 'This slug is already taken. Choose a different one.' }));
      return;
    }

    setSaving(true);

    // Build payload — tags split from comma-separated string
    const payload = {
      title:      values.title.trim(),
      slug:       values.slug.trim(),
      date:       values.date.trim(),
      author:     values.author.trim(),
      category:   values.category.trim(),
      excerpt:    values.excerpt.trim(),
      coverImage: values.coverImage.trim(),
      tags:       values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      readTime:   Number(values.readTime),
      bodyHtml:   values.bodyHtml,
    };

    try {
      const url    = mode === 'edit'
        ? `/api/admin/blogs/${encodeURIComponent(values.slug)}`
        : '/api/admin/blogs';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || 'Save failed. Please try again.');
        setSaving(false);
        return;
      }

      // Success — go back to list; the ISR revalidation (60s) will update /blog
      router.push('/admin/blogs');
    } catch {
      setSaveError('Network error. Please check your connection and try again.');
      setSaving(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Top nav */}
        <div className={styles.topNav}>
          <button type="button" onClick={() => router.push('/admin/blogs')} className={styles.backLink}>
            &#x2190; All Blogs
          </button>
          <h1 className={styles.pageTitle}>
            {isEdit ? `Editing: ${initialPost?.title ?? ''}` : 'New Blog Post'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Core metadata ────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Post Details</h2>

            <div className={styles.grid2}>

              {/* Title — full width */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-title" className={styles.label}>
                  Title <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-title"
                  name="title"
                  type="text"
                  value={values.title}
                  onChange={handleChange}
                  placeholder="The ROI Case for LED Gaming Floors"
                  className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
                  autoFocus={!isEdit}
                />
                {errors.title && <p className={styles.err}>{errors.title}</p>}
              </div>

              {/* Slug — full width */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-slug" className={styles.label}>
                  Slug <span className={styles.req}>*</span>
                  <span className={styles.hint}>
                    {isEdit ? ' — locked after publish' : ' — auto-generated from title, editable'}
                  </span>
                </label>
                <div className={styles.slugRow}>
                  <input
                    id="field-slug"
                    name="slug"
                    type="text"
                    value={values.slug}
                    onChange={handleChange}
                    placeholder="the-roi-case-for-led-gaming-floors"
                    readOnly={isEdit}
                    className={`${styles.input} ${styles.mono} ${errors.slug ? styles.inputErr : ''} ${isEdit ? styles.readonly : ''}`}
                  />
                  {/* Slug status indicator — create mode only */}
                  {mode === 'create' && slugStatus === 'checking'  && <span className={styles.slugChecking}>Checking…</span>}
                  {mode === 'create' && slugStatus === 'available' && <span className={styles.slugOk}>&#10003; Available</span>}
                  {mode === 'create' && slugStatus === 'taken'     && <span className={styles.slugTaken}>&#10007; Taken</span>}
                </div>
                {errors.slug && <p className={styles.err}>{errors.slug}</p>}
                <p className={styles.fieldHint}>
                  Public URL will be: <code>/blog/{values.slug || 'your-slug'}</code>
                </p>
              </div>

              {/* Date */}
              <div className={styles.field}>
                <label htmlFor="field-date" className={styles.label}>
                  Publish Date <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-date"
                  name="date"
                  type="date"
                  value={values.date}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.date ? styles.inputErr : ''}`}
                />
                {errors.date && <p className={styles.err}>{errors.date}</p>}
              </div>

              {/* Read time */}
              <div className={styles.field}>
                <label htmlFor="field-readTime" className={styles.label}>
                  Read Time (mins) <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-readTime"
                  name="readTime"
                  type="number"
                  min={1}
                  max={60}
                  value={values.readTime}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.readTime ? styles.inputErr : ''}`}
                />
                {errors.readTime && <p className={styles.err}>{errors.readTime}</p>}
              </div>

              {/* Author */}
              <div className={styles.field}>
                <label htmlFor="field-author" className={styles.label}>
                  Author <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-author"
                  name="author"
                  type="text"
                  value={values.author}
                  onChange={handleChange}
                  placeholder="FOG Technologies"
                  className={`${styles.input} ${errors.author ? styles.inputErr : ''}`}
                />
                {errors.author && <p className={styles.err}>{errors.author}</p>}
              </div>

              {/* Category */}
              <div className={styles.field}>
                <label htmlFor="field-category" className={styles.label}>
                  Category <span className={styles.req}>*</span>
                </label>
                <select
                  id="field-category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.category ? styles.inputErr : ''}`}
                >
                  <option value="Default">Default</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Updates">Updates</option>
                </select>
                {errors.category && <p className={styles.err}>{errors.category}</p>}
              </div>

              {/* Tags — full width */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-tags" className={styles.label}>
                  Tags <span className={styles.hint}> — optional, comma-separated</span>
                </label>
                <input
                  id="field-tags"
                  name="tags"
                  type="text"
                  value={values.tags}
                  onChange={handleChange}
                  placeholder="Engineering, ROI & Business, Product, Industry Insights"
                  className={styles.input}
                />
              </div>

            </div>
          </div>

          {/* ── Section 2: Excerpt ──────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Excerpt</h2>
            <div className={styles.field}>
              <label htmlFor="field-excerpt" className={styles.label}>
                Short description <span className={styles.req}>*</span>
                <span className={styles.hint}> — shown on the blog listing card</span>
              </label>
              <textarea
                id="field-excerpt"
                name="excerpt"
                value={values.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="How operators across Asia Pacific are achieving full ROI within 8 months using HyperGrid's sensor-activated LED floor technology."
                className={`${styles.textarea} ${errors.excerpt ? styles.inputErr : ''}`}
              />
              <div className={styles.excerptFooter}>
                {errors.excerpt
                  ? <p className={styles.err}>{errors.excerpt}</p>
                  : <span />
                }
                <span className={`${styles.charCount} ${values.excerpt.length > 200 ? styles.charOver : ''}`}>
                  {values.excerpt.length} / 200
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 3: Cover image ───────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Cover Image</h2>
            <div className={styles.field}>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-hidden="true"
              />

              {/* State: uploading */}
              {uploadStatus === 'uploading' && (
                <div className={styles.uploadingState}>
                  <span className={styles.uploadSpinner} />
                  <span className={styles.uploadingText}>Uploading to S3…</span>
                </div>
              )}

              {/* State: image uploaded — show preview */}
              {uploadStatus !== 'uploading' && values.coverImage && (
                <div className={styles.uploadedWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={values.coverImage} alt="Cover preview" className={styles.uploadedImg} />
                  <div className={styles.uploadedBar}>
                    <span className={styles.uploadedUrl} title={values.coverImage}>
                      {values.coverImage.split('/').pop()}
                    </span>
                    <div className={styles.uploadedActions}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.changeBtn}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State: idle, no image — show upload zone */}
              {uploadStatus !== 'uploading' && !values.coverImage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.uploadZone}
                >
                  <span className={styles.uploadZoneIcon} aria-hidden="true">&#128247;</span>
                  <span className={styles.uploadZoneText}>Click to select an image</span>
                  <span className={styles.uploadZoneHint}>JPG, PNG, WebP or GIF · max 4 MB</span>
                </button>
              )}

              {/* Upload error */}
              {uploadError && <p className={styles.err}>{uploadError}</p>}

              {/* URL fallback — always visible so admin can also paste a direct URL */}
              <div className={styles.urlFallback}>
                <label htmlFor="field-coverImage" className={styles.urlFallbackLabel}>
                  Or paste a URL directly
                </label>
                <input
                  id="field-coverImage"
                  name="coverImage"
                  type="text"
                  value={values.coverImage}
                  onChange={handleChange}
                  placeholder="https://bucket.s3.ap-south-1.amazonaws.com/assets/cover.jpg"
                  className={`${styles.input} ${styles.urlInput}`}
                />
              </div>

            </div>
          </div>

          {/* ── Section 4: Body ─────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Body</h2>
            <div className={styles.field}>
              <label className={styles.label}>
                Content
                <span className={styles.hint}> — bold, italic, headings, lists, images supported</span>
              </label>
              <RichTextEditor
                value={values.bodyHtml}
                onChange={(html) => setValues((prev) => ({ ...prev, bodyHtml: html }))}
              />
            </div>
          </div>

          {/* Save error */}
          {saveError && (
            <div className={styles.saveErrorBox}>
              <span>{saveError}</span>
              <button
                type="button"
                onClick={() => setSaveError('')}
                className={styles.saveErrorClose}
                aria-label="Dismiss"
              >
                &#10005;
              </button>
            </div>
          )}

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.push('/admin/blogs')}
              disabled={saving}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving
                ? <><span className={styles.savingSpinner} /> {isEdit ? 'Updating…' : 'Saving…'}</>
                : isEdit ? 'Update Post' : 'Save Post'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
