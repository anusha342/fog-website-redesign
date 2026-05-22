'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './admin.module.css';

export default function AdminLoginPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      router.push(`/admin/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.card}>
        <Image
          src="/images/company_logo.png"
          alt="FOG Technologies"
          width={110}
          height={36}
          className={styles.logo}
          priority
        />

        <h1 className={styles.heading}>Admin Panel</h1>
        <p className={styles.subtext}>
          Enter your authorised email address to receive a one-time password.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={styles.input}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || !email.trim()} className={styles.btn}>
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
