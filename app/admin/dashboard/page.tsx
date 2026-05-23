import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';
import BackToHomeButton from '@/components/admin/BackToHomeButton';
// import MigrateButton from './MigrateButton';

async function getAdminEmail(): Promise<string> {
  const store = await cookies();
  const token = store.get('admin_token')?.value;
  if (!token) return '';
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return (payload.email as string) || '';
  } catch {
    return '';
  }
}

export default async function DashboardPage() {
  const email = await getAdminEmail();
  if (!email) redirect('/admin');

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.meta}>Signed in as <span>{email}</span></p>
          </div>
          {/* <form action="/api/admin/logout" method="POST">
            <button type="submit" className={styles.logoutBtn}>Sign out</button>
          </form> */}
        </div>

        {/* Nav cards */}
        <div className={styles.grid}>
          <Link href="/admin/blogs" className={styles.card}>
            <span className={styles.cardIcon}>&#9998;</span>
            <span className={styles.cardLabel}>Blogs</span>
            <span className={styles.cardDesc}>Create, edit &amp; delete blog posts</span>
            <span className={styles.cardArrow}>&#x2192;</span>
          </Link>

          <Link href="/admin/testimonials" className={styles.card}>
            <span className={styles.cardIcon}>&#9733;</span>
            <span className={styles.cardLabel}>Testimonials</span>
            <span className={styles.cardDesc}>Create, edit &amp; delete testimonials</span>
            <span className={styles.cardArrow}>&#x2192;</span>
          </Link>
        </div>

        {/* One-time Migration — commented out after initial migration completed */}
        {/* <div className={styles.utilSection}>
          <h2 className={styles.utilHeading}>One-time Migration</h2>
          <p className={styles.utilDesc}>
            Upload all existing <code>.md</code> blog files from <code>content/blog/</code> to S3.
            Run this once — it is safe to re-run (it overwrites).
          </p>
          <MigrateButton />
        </div> */}

        {/* Footer */}
        <div className={styles.footer}>
          <BackToHomeButton />
        </div>

      </div>
    </div>
  );
}
