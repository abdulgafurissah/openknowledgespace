'use client';

import { useState, useEffect } from 'react';

import DriveUploader, { DriveUploadResult } from '@/components/DriveUploader';
import styles from '../../admin.module.css';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  price: string;
  isFree: boolean;
  thumbnailUrl: string | null;
  downloadUrl: string | null;
  fileSize: string | null;
  downloadCount: number;
  isPublished: boolean;
  sellerName: string | null;
  createdAt: string;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  ebook: '📖 eBook',
  apk: '📱 Android App (APK)',
  document: '📄 Document',
  other: '📦 Other',
};

export default function AdminMarketplacePage() {

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'ebook' | 'apk' | 'document' | 'other'>('ebook');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  const [fileResult, setFileResult] = useState<DriveUploadResult | null>(null);
  const [thumbResult, setThumbResult] = useState<DriveUploadResult | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !fileType) return;
    if (!fileResult) {
      setError('Please upload a file first.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fileType,
          isFree,
          price: isFree ? '0' : price,
          driveFileId: fileResult.fileId,
          downloadUrl: fileResult.downloadUrl,
          fileMimeType: fileResult.mimeType,
          fileSize: fileResult.size,
          thumbnailUrl: thumbResult?.viewUrl ?? null,
          thumbnailDriveId: thumbResult?.fileId ?? null,
          isPublished: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create item');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setFileType('ebook');
      setIsFree(true);
      setPrice('0');
      setFileResult(null);
      setThumbResult(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this marketplace item? This will also remove it from Google Drive.')) return;
    try {
      await fetch(`/api/marketplace/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch {
      alert('Failed to delete item');
    }
  }

  async function handleTogglePublish(item: MarketplaceItem) {
    try {
      const res = await fetch(`/api/marketplace/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(items.map(i => (i.id === item.id ? { ...i, isPublished: updated.isPublished } : i)));
      }
    } catch {
      alert('Failed to update item');
    }
  }

  return (
    <>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Marketplace Manager</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Manage eBooks, APKs, and downloadable resources. Files are stored on Google Drive.
          </p>
        </div>
        <button
          className={styles.primaryAction}
          onClick={() => setShowForm(!showForm)}
          id="toggle-new-item-form"
        >
          {showForm ? '✕ Cancel' : '+ Add New Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            New Marketplace Item
          </h2>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                color: '#f87171',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="item-title" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Title *
              </label>
              <input
                id="item-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Complete Python Guide"
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  width: '100%',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="item-description" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Description
              </label>
              <textarea
                id="item-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What's inside this resource?"
                rows={3}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  width: '100%',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* File Type + Price row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="item-type" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  File Type *
                </label>
                <select
                  id="item-type"
                  value={fileType}
                  onChange={e => setFileType(e.target.value as typeof fileType)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 1rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                >
                  {Object.entries(FILE_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Pricing
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={e => setIsFree(e.target.checked)}
                      id="item-is-free"
                    />
                    Free
                  </label>
                  {!isFree && (
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Price USD"
                      id="item-price"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem 0.75rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        width: '120px',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Upload File to Google Drive *
              </label>
              <DriveUploader
                accept=".pdf,.epub,.apk,.doc,.docx,.zip,.rar"
                label="Drag & drop your eBook, APK, or document here"
                onUploadComplete={result => setFileResult(result)}
                maxSizeMB={100}
              />
            </div>

            {/* Thumbnail Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Thumbnail Image (optional)
              </label>
              <DriveUploader
                accept="image/*"
                label="Upload a cover image for this item"
                onUploadComplete={result => setThumbResult(result)}
                maxSizeMB={10}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '0.7rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title || !fileResult}
                className={styles.primaryAction}
                id="submit-marketplace-item"
              >
                {submitting ? 'Publishing...' : '🚀 Publish Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'} in marketplace
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading marketplace items...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
            <p>No marketplace items yet. Click &quot;Add New Item&quot; to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Title', 'Type', 'Price', 'Downloads', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '0.85rem 1.25rem',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '260px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {FILE_TYPE_LABELS[item.fileType] ?? item.fileType}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {item.isFree ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {item.downloadCount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: item.isPublished ? 'rgba(29,132,152,0.15)' : 'rgba(90,106,132,0.15)',
                          color: item.isPublished ? 'var(--accent-primary)' : 'var(--text-muted)',
                          border: `1px solid ${item.isPublished ? 'rgba(29,132,152,0.25)' : 'rgba(90,106,132,0.2)'}`,
                        }}
                      >
                        {item.isPublished ? '● Live' : '○ Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleTogglePublish(item)}
                          title={item.isPublished ? 'Unpublish' : 'Publish'}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {item.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
