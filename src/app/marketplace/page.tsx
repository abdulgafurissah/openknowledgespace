import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Marketplace — Open Knowledge Space',
  description: 'Browse and download eBooks, mobile apps, and digital resources from the Open Knowledge Space marketplace.',
};

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  fileType: 'ebook' | 'apk' | 'document' | 'other';
  price: string;
  isFree: boolean;
  thumbnailUrl: string | null;
  downloadCount: number;
  sellerName: string | null;
  createdAt: string;
}

async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/marketplace`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const FILE_TYPE_LABELS: Record<string, string> = {
  ebook: '📖 eBook',
  apk: '📱 Android App',
  document: '📄 Document',
  other: '📦 Resource',
  merch: '👕 Merchandise',
  garment: '👗 Islamic Garment',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  ebook: '#1d8498',
  apk: '#7c3aed',
  document: '#d97706',
  other: '#6b7280',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const allItems = await getMarketplaceItems();

  const filtered = type
    ? allItems.filter(item => item.fileType === type)
    : allItems;

  const filters = [
    { label: 'All', value: '' },
    { label: '📖 eBooks', value: 'ebook' },
    { label: '📱 Apps (APK)', value: 'apk' },
    { label: '📄 Documents', value: 'document' },
    { label: '📦 Other', value: 'other' },
    { label: '👕 Merch', value: 'merch' },
    { label: '👗 Garments', value: 'garment' },
  ];

  return (
    <>
      <style>{`
        .marketplace-hero {
          padding: 5rem 2rem 3rem;
          text-align: center;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, transparent 100%);
          border-bottom: 1px solid var(--border-color);
        }
        .marketplace-hero h1 {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .marketplace-hero p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .marketplace-filters {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          padding: 2rem 2rem 0;
          max-width: 1200px;
          margin: 0 auto;
          justify-content: center;
        }
        .filter-btn {
          padding: 0.45rem 1.1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
          font-family: var(--font-body);
        }
        .filter-btn:hover, .filter-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .item-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all var(--transition-normal);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .item-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-emerald);
        }
        .item-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        .item-thumbnail-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .item-body {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .item-badge {
          display: inline-block;
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          letter-spacing: 0.03em;
          width: fit-content;
        }
        .item-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .item-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        .item-price {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--accent-primary);
        }
        .item-downloads {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
        }
        .empty-state h2 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }
        @media (max-width: 640px) {
          .marketplace-grid { padding: 1rem; gap: 1rem; }
          .marketplace-hero { padding: 3rem 1rem 2rem; }
        }
      `}</style>

      {/* Hero */}
      <section className="marketplace-hero">
        <h1>Knowledge Marketplace</h1>
        <p>Download eBooks, Android apps, documents and digital resources curated by our instructors.</p>
      </section>

      {/* Filters */}
      <nav className="marketplace-filters" aria-label="Filter marketplace items">
        {filters.map(f => (
          <Link
            key={f.value}
            href={f.value ? `/marketplace?type=${f.value}` : '/marketplace'}
            className={`filter-btn ${type === f.value || (!type && !f.value) ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {/* Grid */}
      <main className="marketplace-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h2>No items found</h2>
            <p>Check back soon — new resources are added regularly.</p>
          </div>
        ) : (
          filtered.map(item => (
            <Link key={item.id} href={`/marketplace/${item.id}`} className="item-card">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumbnailUrl} alt={item.title} className="item-thumbnail" />
              ) : (
                <div className="item-thumbnail-placeholder">
                  {FILE_TYPE_LABELS[item.fileType]?.split(' ')[0] ?? '📦'}
                </div>
              )}

              <div className="item-body">
                <span
                  className="item-badge"
                  style={{
                    background: `${FILE_TYPE_COLORS[item.fileType]}22`,
                    color: FILE_TYPE_COLORS[item.fileType],
                    border: `1px solid ${FILE_TYPE_COLORS[item.fileType]}44`,
                  }}
                >
                  {FILE_TYPE_LABELS[item.fileType] ?? item.fileType}
                </span>

                <div className="item-title">{item.title}</div>
                {item.description && (
                  <div className="item-description">{item.description}</div>
                )}

                <div className="item-footer">
                  <span className="item-price">
                    {item.isFree ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                  </span>
                  <span className="item-downloads">
                    ⬇ {item.downloadCount.toLocaleString()} downloads
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </>
  );
}
