'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PostMeta } from '@/lib/blog';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import styles from './blogs.module.css';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function AdminBlogsPage() {
  const [posts, setPosts]           = useState<PostMeta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pendingDelete, setPendingDelete] = useState<PostMeta | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetch('/api/admin/blogs')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setError(data.error || 'Failed to load blogs.');
      })
      .catch(() => setError('Network error. Could not load blogs.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/blogs/${pendingDelete.slug}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete post.');
        setDeleting(false);
        return;
      }

      // Remove from local state — no refetch needed
      setPosts((prev) => prev.filter((p) => p.slug !== pendingDelete.slug));
      setPendingDelete(null);
    } catch {
      setDeleteError('Network error. Could not delete post.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <ConfirmDeleteModal
          title={pendingDelete.title}
          slug={pendingDelete.slug}
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
            <h1 className={styles.heading}>All Blogs</h1>
          </div>
          <Link href="/admin/blogs/new" className={styles.newBtn}>+ New Blog</Link>
        </div>

        {/* States */}
        {loading && (
          <div className={styles.stateBox}>
            <span className={styles.spinner} />
            <p className={styles.stateText}>Loading blogs from S3…</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className={styles.stateBox}>
            <p className={styles.stateText}>No blog posts yet.</p>
            <Link href="/admin/blogs/new" className={styles.newBtn} style={{ marginTop: 12 }}>
              Create your first post
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && !error && posts.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th} style={{ width: 90, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.slug} className={styles.row}>
                    <td className={styles.td}>
                      <div className={styles.postTitle}>{post.title}</div>
                      <div className={styles.postSlug}>{post.slug}</div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.catBadge}>{post.category}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.dateText}>{formatDate(post.date)}</span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/blogs/${post.slug}/edit`}
                          className={styles.editBtn}
                          title="Edit post"
                        >
                          ✏
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          title="Delete post"
                          onClick={() => { setDeleteError(''); setPendingDelete(post); }}
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

        {deleteError && (
          <div className={styles.errorBox}>
            <p>{deleteError}</p>
            <button onClick={() => setDeleteError('')} className={styles.retryBtn}>Dismiss</button>
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.count}>{posts.length} post{posts.length !== 1 ? 's' : ''} total</span>
          <Link href="/" target="_blank" className={styles.viewSiteLink}>
            View public blog &#x2197;
          </Link>
        </div>

      </div>
    </div>
  );
}
