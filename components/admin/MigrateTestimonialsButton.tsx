'use client';

import { useState } from 'react';
import styles from '../../app/admin/testimonials/testimonials.module.css';

interface Props {
  onMigrated?: () => void;
}

export default function MigrateTestimonialsButton({ onMigrated }: Props) {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleMigrate() {
    if (!confirm('This will upload all .md testimonial files from content/testimonials/ to S3. Existing entries with the same slug will be overwritten. Continue?')) return;
    setStatus('loading');
    setMessage('');

    try {
      const res  = await fetch('/api/admin/migrate-testimonials', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Migration failed.');
        return;
      }
      setStatus('done');
      setMessage(data.message);
      onMigrated?.();
    } catch {
      setStatus('error');
      setMessage('Network error during migration.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        onClick={handleMigrate}
        disabled={status === 'loading'}
        className={styles.migrateBtn}
      >
        {status === 'loading' ? 'Migrating…' : 'Import .md files → S3'}
      </button>
      {status === 'done'  && <p className={styles.utilSuccess}>{message}</p>}
      {status === 'error' && <p className={styles.utilError}>{message}</p>}
    </div>
  );
}
