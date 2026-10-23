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
          padding: 5rem 2rem 3.5rem;
          text-align: center;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .marketplace-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .marketplace-hero p {
          font-family: var(--font-body);
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .marketplace-filters {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 3rem 2rem 0;
          max-width: 1200px;
          margin: 0 auto;
          justify-content: center;
        }
        .filter-btn {
          padding: 0.55rem 1.3rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          background: #ffffff;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        .filter-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .filter-btn.active {
          background: var(--bg-dark);
          border-color: var(--bg-dark);
          color: var(--accent-primary);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
        }
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 3rem 2rem 6rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .item-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all var(--transition-normal);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        .item-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), #ecd183);
          opacity: 0;
          transition: opacity var(--transition-normal);
          z-index: 2;
        }
        .item-card:hover {
          transform: translateY(-5px);
          border-color: var(--gold-border);
          box-shadow: var(--shadow-lg), 0 0 24px rgba(212, 168, 67, 0.15);
        }
        .item-card:hover::before {
          opacity: 1;
        }
        .item-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .item-card:hover .item-thumbnail {
          transform: scale(1.03);
        }
        .item-thumbnail-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .item-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .item-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          width: fit-content;
        }
        .item-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .item-description {
          font-family: var(--font-body);
          font-size: 0.88rem;
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
          margin-top: 0.85rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-color);
        }
        .item-price {
          font-family: var(--font-mono);
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--gold);
        }
        .item-downloads {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
        }
        .empty-state h2 {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        @media (max-width: 640px) {
          .marketplace-grid { padding: 1.5rem 1rem; gap: 1.25rem; }
          .marketplace-hero { padding: 3.5rem 1rem 2.5rem; }
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
