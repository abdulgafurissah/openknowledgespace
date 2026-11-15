import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/suq/ProductCard';
import { getCategoryBySlug, getProductsByCategory, getCategories } from '@/lib/suq/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category Not Found — Open Suq' };
  }

  return {
    title: `${category.name} — Open Suq`,
    description: category.description || `Browse ${category.name} in Open Suq.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, allCategories, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProductsByCategory(slug),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="suq-cat-page">
      <Navbar />

      <style>{`
        .suq-cat-page {
          min-height: 100vh;
          background: var(--bg-primary, #f4efe6);
        }
        .suq-cat-hero {
          background: var(--bg-secondary, #ece6dc);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          padding: 3.5rem 1.5rem 3rem;
          text-align: center;
        }
        .suq-cat-hero-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .suq-cat-breadcrumbs {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted, #74747c);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
        }
        .suq-cat-breadcrumbs a {
          color: var(--text-secondary, #444);
        }
        .suq-cat-breadcrumbs a:hover {
          color: var(--accent-primary, #d4a843);
        }
        .suq-cat-hero h1 {
          font-family: var(--font-heading, serif);
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .suq-cat-hero p {
          font-size: 1.1rem;
          color: var(--text-secondary, #444);
          line-height: 1.7;
          margin: 0 auto;
        }
        .suq-cat-nav-bar {
          background: #ffffff;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          padding: 1rem 1.5rem;
        }
        .suq-cat-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .suq-cat-chip {
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: var(--bg-secondary, #ece6dc);
          color: var(--text-primary, #121214);
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .suq-cat-chip:hover {
          border-color: var(--accent-primary, #d4a843);
          color: var(--accent-primary, #d4a843);
        }
        .suq-cat-chip.active {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          border-color: var(--bg-dark, #121214);
        }
        .suq-cat-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .suq-cat-meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: var(--text-muted, #74747c);
        }
        .suq-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        .suq-empty-cat {
          text-align: center;
          padding: 5rem 1.5rem;
          background: #ffffff;
          border-radius: var(--radius-2xl, 2rem);
          border: 1px dashed var(--border-color, rgba(0,0,0,0.15));
        }
      `}</style>

      {/* Hero */}
      <section className="suq-cat-hero">
        <div className="suq-cat-hero-container">
          <div className="suq-cat-breadcrumbs">
            <Link href="/suq">Open Suq</Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          <h1>{category.name}</h1>
          {category.description && <p>{category.description}</p>}
        </div>
      </section>

      {/* Subcategory & Category Navigation Bar */}
      <nav className="suq-cat-nav-bar" aria-label="Category and Subcategory Filter">
        <div className="suq-cat-nav-container">
          <Link
            href="/suq"
            className="suq-cat-chip"
          >
            ← All Collections
          </Link>

          {allCategories.map(c => (
            <Link
              key={c.id}
              href={`/suq/c/${c.slug}`}
              className={`suq-cat-chip ${c.slug === category.slug ? 'active' : ''}`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="suq-cat-main">
        <div className="suq-cat-meta-bar">
          <div>
            Showing <strong>{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="suq-empty-cat">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
              New items coming soon to {category.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              Our design and curation team is currently preparing custom POD artwork and book titles for this collection.
            </p>
            <Link href="/suq" className="almaghrib-pill-btn">
              Browse Other Collections →
            </Link>
          </div>
        ) : (
          <div className="suq-products-grid">
            {products.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
