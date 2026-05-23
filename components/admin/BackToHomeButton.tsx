'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoutConfirmModal from './LogoutConfirmModal';
import styles from '../../app/admin/dashboard/dashboard.module.css';

export default function BackToHomeButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  async function handleProceed() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/');
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.homeBtn}>
        &#x2190; Back to Home
      </button>

      {showModal && (
        <LogoutConfirmModal
          destination="the home page"
          onProceed={handleProceed}
          onCancel={() => { if (!loading) setShowModal(false); }}
          loading={loading}
        />
      )}
    </>
  );
}
