'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoutConfirmModal from '@/components/admin/LogoutConfirmModal';
import styles from './logout-confirm.module.css';

function LogoutConfirmInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/';
  const [loading, setLoading] = useState(false);

  async function handleProceed() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push(redirect);
    }
  }

  function handleCancel() {
    router.push('/admin/dashboard');
  }

  // Format the destination label for display
  const destination = redirect === '/' ? 'the home page' : redirect;

  return (
    <div className={styles.page}>
      <LogoutConfirmModal
        destination={destination}
        onProceed={handleProceed}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}

export default function LogoutConfirmPage() {
  return (
    <Suspense>
      <LogoutConfirmInner />
    </Suspense>
  );
} 
