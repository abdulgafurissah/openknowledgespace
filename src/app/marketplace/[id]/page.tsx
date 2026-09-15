import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  fileType: 'ebook' | 'apk' | 'document' | 'other' | 'merch' | 'garment';
  price: string;
  isFree: boolean;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  fileMimeType: string | null;
  fileSize: string | null;
  downloadCount: number;
  sellerName: string | null;
  createdAt: string;
}

async function getItem(id: string): Promise<MarketplaceItem | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/marketplace/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return {
    title: item ? `${item.title} — Marketplace` : 'Item Not Found',
    description: item?.description ?? undefined,
  };
}

const FILE_TYPE_LABELS: Record<string, string> = {
  ebook: '📖 eBook',
  apk: '📱 Android App',
  document: '📄 Document',
  other: '📦 Resource',
  merch: '👕 Merchandise',
  garment: '👗 Islamic Garment',
};

function formatSize(bytes: string | null): string {
  if (!bytes) return '';
  const n = parseInt(bytes, 10);
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <style>{`
        .item-detail-layout {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .item-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color var(--transition-fast);
        }
        .item-detail-back:hover { color: var(--accent-primary); }
        .item-detail-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }
        .item-detail-thumbnail {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }
        .item-detail-thumbnail-placeholder {
          width: 100%;
          height: 280px;
          background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
        }
        .item-detail-body {
          padding: 2.5rem;
        }
        .item-detail-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .item-detail-badge {
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--accent-light);
          color: var(--accent-primary);
          border: 1px solid rgba(29,132,152,0.25);
        }
        .item-detail-title {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-family: var(--font-heading);
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.25;
        }
        .item-detail-description {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1rem;
          margin-bottom: 2rem;
        }
        .item-detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
        .item-info-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .item-info-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .item-info-value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .item-download-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.9rem 2rem;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
          color: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all var(--transition-normal);
          box-shadow: var(--shadow-emerald);
        }
        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(29,132,152,0.4);
          color: white;
        }
        .btn-paid {
          background: linear-gradient(135deg, #7c3aed, #9c5dec);
          box-shadow: 0 4px 28px rgba(124,58,237,0.2);
        }
        .btn-paid:hover {
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
        }
        .item-price-tag {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
        }
        @media (max-width: 640px) {
          .item-detail-layout { padding: 2rem 1rem; }
          .item-detail-body { padding: 1.5rem; }
        }
      `}</style>

      <div className="item-detail-layout">
        <Link href="/marketplace" className="item-detail-back">
          ← Back to Marketplace
        </Link>

        <article className="item-detail-card">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="item-detail-thumbnail"
            />
          ) : (
            <div className="item-detail-thumbnail-placeholder">
              {FILE_TYPE_LABELS[item.fileType]?.split(' ')[0] ?? '📦'}
            </div>
          )}

          <div className="item-detail-body">
            <div className="item-detail-meta">
              <span className="item-detail-badge">
                {FILE_TYPE_LABELS[item.fileType] ?? item.fileType}
              </span>
              {item.sellerName && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  by <strong style={{ color: 'var(--text-primary)' }}>{item.sellerName}</strong>
                </span>
              )}
            </div>

            <h1 className="item-detail-title">{item.title}</h1>

            {item.description && (
              <p className="item-detail-description">{item.description}</p>
            )}

            {/* Info Grid */}
            <div className="item-detail-info-grid">
              <div className="item-info-cell">
                <span className="item-info-label">Type</span>
                <span className="item-info-value">{FILE_TYPE_LABELS[item.fileType]}</span>
              </div>
              <div className="item-info-cell">
                <span className="item-info-label">Price</span>
                <span className="item-info-value">
                  {item.isFree ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                </span>
              </div>
              {item.fileSize && (
                <div className="item-info-cell">
                  <span className="item-info-label">File Size</span>
                  <span className="item-info-value">{formatSize(item.fileSize)}</span>
                </div>
              )}
              <div className="item-info-cell">
                <span className="item-info-label">Downloads</span>
                <span className="item-info-value">{item.downloadCount.toLocaleString()}</span>
              </div>
              <div className="item-info-cell">
                <span className="item-info-label">Published</span>
                <span className="item-info-value">{formattedDate}</span>
              </div>
            </div>

            {/* Download / Price CTA */}
            <div className="item-download-section">
              {(item.fileType === 'merch' || item.fileType === 'garment') ? (
                <>
                  <span className="item-price-tag">
                    {item.isFree ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                  </span>
                  <a
                    href={item.downloadUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download btn-paid"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    Contact to Purchase
                  </a>
                </>
              ) : item.isFree && item.downloadUrl ? (
                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download"
                  id={`download-${item.id}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Free
                </a>
              ) : !item.isFree ? (
                <>
                  <span className="item-price-tag">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                  <button
                    className="btn-download btn-paid"
                    id={`purchase-${item.id}`}
                    onClick={() => alert('Payment integration coming soon!')}
                  >
                    Purchase & Download
                  </button>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  File not available for download yet.
                </span>
              )}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
