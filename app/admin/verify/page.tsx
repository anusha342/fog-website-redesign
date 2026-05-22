'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../admin.module.css';

function VerifyForm() {
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Redirect back if no email in URL
  useEffect(() => {
    if (!email) router.replace('/admin');
  }, [email, router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired OTP. Please try again.');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not resend OTP.');
        return;
      }

      setSuccess('A new OTP has been sent to your email.');
      setOtp('');
      setCooldown(60);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
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

        <h1 className={styles.heading}>Check your email</h1>
        <p className={styles.subtext}>
          We sent a 6-digit OTP to<br />
          <strong style={{ color: '#fff' }}>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className={styles.form}>
          <div>
            <label htmlFor="otp" className={styles.label}>One-time password</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className={styles.input}
              required
              autoFocus
              autoComplete="one-time-code"
              style={{ letterSpacing: '6px', fontSize: '20px', textAlign: 'center' }}
            />
          </div>

          <p className={styles.otpHint}>OTP expires in <span>10 minutes</span></p>

          {error   && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={styles.btn}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className={styles.btnGhost}
          >
            {cooldown > 0
              ? `Resend OTP (${cooldown}s)`
              : resending
              ? 'Sending…'
              : 'Resend OTP'}
          </button>
        </form>

        <hr className={styles.divider} />
        <a href="/admin" className={styles.backLink}>← Use a different email</a>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
