'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { TestimonialMeta } from '@/lib/testimonials';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
// import MigrateTestimonialsButton from '@/components/admin/MigrateTestimonialsButton';
import styles from './testimonials.module.css';

export default function AdminTestimonialsPage() {
  const [testimonials,  setTestimonials]  = useState<TestimonialMeta[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [pendingDelete, setPendingDelete] = useState<TestimonialMeta | null>(null);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const loadTestimonials = useCallback(() => {
    setLoading(true);
    setError('');
    fetch('/api/admin/testimonials')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTestimonials(data);
        else setError(data.error || 'Failed to load testimonials.');
      })
      .catch(() => setError('Network error. Could not load testimonials.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res  = await fetch(
        `/api/admin/testimonials/${encodeURIComponent(pendingDelete.slug)}`,
        { method: 'DELETE' },
      );
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete testimonial.');
        setDeleting(false);
        return;
      }

      // Remove from local state — no refetch needed
      setTestimonials((prev) => prev.filter((t) => t.slug !== pendingDelete.slug));
      setPendingDelete(null);
    } catch {
      setDeleteError('Network error. Could not delete testimonial.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <ConfirmDeleteModal
          title={pendingDelete.name}
          slug={pendingDelete.slug}
          entityLabel="testimonial"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setPendingDelete(null); setDeleteError(''); }}
        />
      )}

      <div className={styles.container}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <Link href="/admin/dashboard" className={styles.backLink}>&#x2190; Dashboard</Link>
            <h1 className={styles.heading}>All Testimonials</h1>
          </div>
          <Link href="/admin/testimonials/new" className={styles.newBtn}>+ New Testimonial</Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.stateBox}>
            <span className={styles.spinner} />
            <p className={styles.stateText}>Loading testimonials from S3…</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && testimonials.length === 0 && (
          <div className={styles.stateBox}>
            <p className={styles.stateText}>No testimonials yet.</p>
            <Link href="/admin/testimonials/new" className={styles.newBtn} style={{ marginTop: 12 }}>
              Add your first testimonial
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && !error && testimonials.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Company</th>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th} style={{ width: 90, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.slug} className={styles.row}>

                    {/* Name + slug */}
                    <td className={styles.td}>
                      <div className={styles.nameText}>{t.name}</div>
                      <div className={styles.slugText}>{t.slug}</div>
                    </td>

                    {/* Company */}
                    <td className={styles.td}>
                      <span className={styles.companyText}>{t.company}</span>
                    </td>

                    {/* Product */}
                    <td className={styles.td}>
                      <span className={styles.productBadge}>{t.product}</span>
                    </td>

                    {/* Actions */}
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/testimonials/${t.slug}/edit`}
                          className={styles.editBtn}
                          title="Edit testimonial"
                        >
                          ✏
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          title="Delete testimonial"
                          onClick={() => { setDeleteError(''); setPendingDelete(t); }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inline delete error */}
        {deleteError && (
          <div className={styles.errorBox}>
            <p>{deleteError}</p>
            <button onClick={() => setDeleteError('')} className={styles.retryBtn}>Dismiss</button>
          </div>
        )}

        {/* Migrate .md files section — temporarily disabled */}
        {/* <div className={styles.utilSection}>
          <h2 className={styles.utilHeading}>Import from .md files</h2>
          <p className={styles.utilDesc}>
            Read all content/testimonials/*.md files and upload them to S3.
            Existing testimonials with the same slug will be overwritten.
          </p>
          <MigrateTestimonialsButton onMigrated={loadTestimonials} />
        </div> */}

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.count}>
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} total
          </span>
          <Link href="/" target="_blank" className={styles.viewSiteLink}>
            View site &#x2197;
          </Link>
        </div>

      </div>
    </div>
  );
}
