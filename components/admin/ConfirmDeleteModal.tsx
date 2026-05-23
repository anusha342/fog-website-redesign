'use client';

import { useEffect, useRef } from 'react';
import styles from './confirm-delete-modal.module.css';

interface Props {
  title:        string;
  slug:         string;
  onConfirm:    () => void;
  onCancel:     () => void;
  loading:      boolean;
  entityLabel?: string; // e.g. 'post' (default) or 'testimonial'
}

export default function ConfirmDeleteModal({ title, slug, onConfirm, onCancel, loading, entityLabel = 'post' }: Props) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus cancel on open (safer default)
  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  return (
    <div className={styles.backdrop} onClick={loading ? undefined : onCancel} role="dialog" aria-modal="true" aria-labelledby="delete-modal-heading">

      {/* Stop backdrop click from closing when clicking inside the card */}
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>

        {/* Icon */}
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>🗑</span>
        </div>

        {/* Copy */}
        <h2 id="delete-modal-heading" className={styles.heading}>Delete this {entityLabel}?</h2>
        <p className={styles.body}>
          You are about to permanently delete:
        </p>
        <div className={styles.postPreview}>
          <span className={styles.postTitle}>{title}</span>
          <span className={styles.postSlug}>{slug}</span>
        </div>
        <p className={styles.warning}>
          This action <strong>cannot be undone</strong>. The {entityLabel} will be removed from S3 and will no longer appear on the site.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={styles.deleteBtn}
          >
            {loading ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>

      </div>
    </div>
  );
}
