'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial } from '@/lib/testimonials';
import styles from './testimonial-form.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  'HyperGrid',
  'Laser Tag',
  'Laser Spy',
  'Moments AI Break',
  'Moments',
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormValues {
  name:        string;
  slug:        string;
  company:     string;
  designation: string;
  product:     string;
  location:    string;
  avatar:      string; // URL
  logo:        string; // URL
  body:        string;
}

type FieldErrors  = Partial<Record<keyof FormValues, string>>;
type SlugStatus   = 'idle' | 'checking' | 'available' | 'taken';
type UploadStatus = 'idle' | 'uploading' | 'error';

export interface Props {
  mode:                'create' | 'edit';
  initialTestimonial?: Testimonial;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function emptyForm(): FormValues {
  return {
    name:        '',
    slug:        '',
    company:     '',
    designation: '',
    product:     PRODUCTS[0],
    location:    '',
    avatar:      '',
    logo:        '',
    body:        '',
  };
}

function testimonialToForm(t: Testimonial): FormValues {
  return {
    name:        t.name,
    slug:        t.slug,
    company:     t.company,
    designation: t.designation,
    product:     t.product,
    location:    t.location,
    avatar:      t.avatar ?? '',
    logo:        t.logo   ?? '',
    body:        t.body,
  };
}

const REQUIRED_FIELDS: (keyof FormValues)[] = [
  'name', 'slug', 'company', 'designation', 'product', 'location', 'body',
];

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of REQUIRED_FIELDS) {
    if (!values[key].trim()) errors[key] = 'This field is required.';
  }
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TestimonialForm({ mode, initialTestimonial }: Props) {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>(
    () => initialTestimonial ? testimonialToForm(initialTestimonial) : emptyForm()
  );
  const [errors,             setErrors]             = useState<FieldErrors>({});
  const [slugStatus,         setSlugStatus]         = useState<SlugStatus>('idle');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [saving,             setSaving]             = useState(false);
  const [saveError,          setSaveError]          = useState('');

  // ── Avatar upload state ───────────────────────────────────────────────────
  const [avatarStatus, setAvatarStatus] = useState<UploadStatus>('idle');
  const [avatarError,  setAvatarError]  = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // ── Logo upload state ─────────────────────────────────────────────────────
  const [logoStatus, setLogoStatus] = useState<UploadStatus>('idle');
  const [logoError,  setLogoError]  = useState('');
  const logoFileRef = useRef<HTMLInputElement>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-generate slug from name (create mode only) ──────────────────────
  useEffect(() => {
    if (slugManuallyEdited) return;
    setValues((prev) => ({ ...prev, slug: toSlug(prev.name) }));
  }, [values.name, slugManuallyEdited]);

  // ── Slug collision check ──────────────────────────────────────────────────
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || mode === 'edit') return;
    setSlugStatus('checking');
    try {
      const res = await fetch(`/api/admin/testimonials/${encodeURIComponent(slug)}`);
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
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name as keyof FormValues]; return n; });
    }
    if (name === 'slug') setSlugManuallyEdited(true);
  }

  // ── Shared image upload ───────────────────────────────────────────────────
  async function handleImageUpload(
    file:      File,
    field:     'avatar' | 'logo',
    setStatus: (s: UploadStatus) => void,
    setError:  (e: string) => void,
  ) {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setError('Only JPG, PNG, WebP and GIF images are allowed.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('File must be smaller than 4 MB.');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res  = await fetch('/api/admin/upload?folder=testimonials', {
        method: 'POST',
        body:   formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed.');
        setStatus('error');
        return;
      }

      setValues((prev) => ({ ...prev, [field]: data.url }));
      setStatus('idle');
    } catch {
      setError('Network error during upload.');
      setStatus('error');
    }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    handleImageUpload(file, 'avatar', setAvatarStatus, setAvatarError);
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    handleImageUpload(file, 'logo', setLogoStatus, setLogoError);
  }

  function removeImage(field: 'avatar' | 'logo') {
    setValues((prev) => ({ ...prev, [field]: '' }));
    if (field === 'avatar') { setAvatarStatus('idle'); setAvatarError(''); }
    else                    { setLogoStatus('idle');   setLogoError(''); }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');

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

    const payload = {
      name:        values.name.trim(),
      slug:        values.slug.trim(),
      company:     values.company.trim(),
      designation: values.designation.trim(),
      product:     values.product.trim(),
      location:    values.location.trim(),
      avatar:      values.avatar.trim(),
      logo:        values.logo.trim(),
      body:        values.body.trim(),
    };

    try {
      const url    = mode === 'edit'
        ? `/api/admin/testimonials/${encodeURIComponent(values.slug)}`
        : '/api/admin/testimonials';
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

      // Success — go back to list
      router.push('/admin/testimonials');
    } catch {
      setSaveError('Network error. Please check your connection and try again.');
      setSaving(false);
    }
  }

  // ── Reusable upload block (avatar & logo share the same UI) ──────────────
  function UploadBlock({
    field,
    label,
    fileRef,
    uploadStatus,
    uploadError,
    icon,
    hint,
    onSelect,
  }: {
    field:        'avatar' | 'logo';
    label:        string;
    fileRef:      React.RefObject<HTMLInputElement | null>;
    uploadStatus: UploadStatus;
    uploadError:  string;
    icon:         string;
    hint:         string;
    onSelect:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) {
    const imageUrl = values[field];
    return (
      <div className={styles.field}>
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onSelect}
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

        {/* State: image uploaded — preview */}
        {uploadStatus !== 'uploading' && imageUrl && (
          <div className={styles.uploadedWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={`${label} preview`} className={styles.uploadedImg} />
            <div className={styles.uploadedBar}>
              <span className={styles.uploadedUrl} title={imageUrl}>
                {imageUrl.split('/').pop()}
              </span>
              <div className={styles.uploadedActions}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={styles.changeBtn}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(field)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: idle, no image — upload zone */}
        {uploadStatus !== 'uploading' && !imageUrl && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={styles.uploadZone}
          >
            <span className={styles.uploadZoneIcon} aria-hidden="true">{icon}</span>
            <span className={styles.uploadZoneText}>{hint}</span>
            <span className={styles.uploadZoneHint}>JPG, PNG, WebP or GIF · max 4 MB</span>
          </button>
        )}

        {uploadError && <p className={styles.err}>{uploadError}</p>}

        {/* URL fallback — always visible */}
        <div className={styles.urlFallback}>
          <label htmlFor={`field-${field}`} className={styles.urlFallbackLabel}>
            Or paste a URL directly
          </label>
          <input
            id={`field-${field}`}
            name={field}
            type="text"
            value={imageUrl}
            onChange={handleChange}
            placeholder={`https://bucket.s3.ap-south-1.amazonaws.com/testimonials/assets/${field}.jpg`}
            className={`${styles.input} ${styles.urlInput}`}
          />
        </div>
      </div>
    );
  }

  const isEdit = mode === 'edit';

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Top nav */}
        <div className={styles.topNav}>
          <button
            type="button"
            onClick={() => router.push('/admin/testimonials')}
            className={styles.backLink}
          >
            &#x2190; All Testimonials
          </button>
          <h1 className={styles.pageTitle}>
            {isEdit ? `Editing: ${initialTestimonial?.name ?? ''}` : 'New Testimonial'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Person Details ──────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Person Details</h2>
            <div className={styles.grid2}>

              {/* Name — full width */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-name" className={styles.label}>
                  Name <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-name"
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Rajiv Mehta"
                  className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
                  autoFocus={!isEdit}
                />
                {errors.name && <p className={styles.err}>{errors.name}</p>}
              </div>

              {/* Slug — full width */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-slug" className={styles.label}>
                  Slug <span className={styles.req}>*</span>
                  <span className={styles.hint}>
                    {isEdit ? ' — locked after creation' : ' — auto-generated from name, editable'}
                  </span>
                </label>
                <div className={styles.slugRow}>
                  <input
                    id="field-slug"
                    name="slug"
                    type="text"
                    value={values.slug}
                    onChange={handleChange}
                    placeholder="rajiv-mehta"
                    readOnly={isEdit}
                    className={`${styles.input} ${styles.mono} ${errors.slug ? styles.inputErr : ''} ${isEdit ? styles.readonly : ''}`}
                  />
                  {mode === 'create' && slugStatus === 'checking'  && <span className={styles.slugChecking}>Checking…</span>}
                  {mode === 'create' && slugStatus === 'available' && <span className={styles.slugOk}>&#10003; Available</span>}
                  {mode === 'create' && slugStatus === 'taken'     && <span className={styles.slugTaken}>&#10007; Taken</span>}
                </div>
                {errors.slug && <p className={styles.err}>{errors.slug}</p>}
              </div>

              {/* Designation */}
              <div className={styles.field}>
                <label htmlFor="field-designation" className={styles.label}>
                  Designation <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-designation"
                  name="designation"
                  type="text"
                  value={values.designation}
                  onChange={handleChange}
                  placeholder="Operations Director"
                  className={`${styles.input} ${errors.designation ? styles.inputErr : ''}`}
                />
                {errors.designation && <p className={styles.err}>{errors.designation}</p>}
              </div>

              {/* Company */}
              <div className={styles.field}>
                <label htmlFor="field-company" className={styles.label}>
                  Company <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-company"
                  name="company"
                  type="text"
                  value={values.company}
                  onChange={handleChange}
                  placeholder="Masti Zone India"
                  className={`${styles.input} ${errors.company ? styles.inputErr : ''}`}
                />
                {errors.company && <p className={styles.err}>{errors.company}</p>}
              </div>

              {/* Location */}
              <div className={styles.field}>
                <label htmlFor="field-location" className={styles.label}>
                  Location <span className={styles.req}>*</span>
                </label>
                <input
                  id="field-location"
                  name="location"
                  type="text"
                  value={values.location}
                  onChange={handleChange}
                  placeholder="Bangalore, India"
                  className={`${styles.input} ${errors.location ? styles.inputErr : ''}`}
                />
                {errors.location && <p className={styles.err}>{errors.location}</p>}
              </div>

              {/* Product — full width select */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label htmlFor="field-product" className={styles.label}>
                  Product <span className={styles.req}>*</span>
                  <span className={styles.hint}> — FOG product this testimonial is about</span>
                </label>
                <select
                  id="field-product"
                  name="product"
                  value={values.product}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.product ? styles.inputErr : ''}`}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.product && <p className={styles.err}>{errors.product}</p>}
              </div>

            </div>
          </div>

          {/* ── Section 2: Quote ─────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Quote</h2>
            <div className={styles.field}>
              <label htmlFor="field-body" className={styles.label}>
                Testimonial <span className={styles.req}>*</span>
                <span className={styles.hint}> — the operator's quote in their own words</span>
              </label>
              <textarea
                id="field-body"
                name="body"
                value={values.body}
                onChange={handleChange}
                rows={5}
                placeholder="FOG's products didn't just fill floor space — they became the anchor attraction. Our revenue per square foot tripled within the first quarter…"
                className={`${styles.textarea} ${errors.body ? styles.inputErr : ''}`}
              />
              <div className={styles.excerptFooter}>
                {errors.body
                  ? <p className={styles.err}>{errors.body}</p>
                  : <span />
                }
                <span className={`${styles.charCount} ${values.body.length > 400 ? styles.charOver : ''}`}>
                  {values.body.length} / 400
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 3: Avatar ────────────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Avatar</h2>
            <UploadBlock
              field="avatar"
              label="Avatar"
              fileRef={avatarFileRef}
              uploadStatus={avatarStatus}
              uploadError={avatarError}
              icon="&#128100;"
              hint="Click to upload a headshot"
              onSelect={handleAvatarSelect}
            />
          </div>

          {/* ── Section 4: Company Logo ───────────────────────────────────── */}
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Company Logo</h2>
            <UploadBlock
              field="logo"
              label="Logo"
              fileRef={logoFileRef}
              uploadStatus={logoStatus}
              uploadError={logoError}
              icon="&#127970;"
              hint="Click to upload a company logo"
              onSelect={handleLogoSelect}
            />
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

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.push('/admin/testimonials')}
              disabled={saving}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving
                ? <><span className={styles.savingSpinner} /> {isEdit ? 'Updating…' : 'Saving…'}</>
                : isEdit ? 'Update Testimonial' : 'Save Testimonial'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
