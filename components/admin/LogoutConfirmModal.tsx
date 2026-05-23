'use client';

import styles from './logout-confirm-modal.module.css';

interface Props {
  destination: string;
  onProceed: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function LogoutConfirmModal({ destination, onProceed, onCancel, loading }: Props) {
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCancel();
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
        <div className={styles.iconWrap} aria-hidden="true">&#9888;</div>

        <h2 id="logout-modal-title" className={styles.title}>
          You&apos;ll be logged out
        </h2>

        <p className={styles.body}>
          Navigating to <strong>{destination}</strong> will end your admin session.
          You&apos;ll need to sign in again to return to the panel.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className={styles.proceedBtn}
          >
            {loading ? 'Logging out…' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
