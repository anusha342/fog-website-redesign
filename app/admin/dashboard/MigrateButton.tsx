'use client';

import { useState } from 'react';
import styles from './dashboard.module.css';

export default function MigrateButton() {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleMigrate() {
    if (!confirm('This will upload all .md blog files to S3. Continue?')) return;
    setStatus('loading');
    setMessage('');

    try {
      const res  = await fetch('/api/admin/migrate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Migration failed.');
        return;
      }
      setStatus('done');
      setMessage(data.message);
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
        {status === 'loading' ? 'Migrating…' : 'Migrate .md files → S3'}
      </button>
      {status === 'done'  && <p className={styles.utilSuccess}>{message}</p>}
      {status === 'error' && <p className={styles.utilError}>{message}</p>}
    </div>
  );
}
