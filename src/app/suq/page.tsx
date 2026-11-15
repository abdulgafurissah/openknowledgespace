import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/suq/ProductCard';
import NewsletterForm from '@/components/suq/NewsletterForm';
import { getCategories, getFeaturedProducts, getRecentProducts } from '@/lib/suq/products';

export const metadata: Metadata = {
  title: 'Open Suq — The Marketplace of Open Knowledge Space',
  description: 'An international Islamic marketplace for educational books, Arabic calligraphy apparel, minimalist wall art, and thoughtfully designed lifestyle merchandise.',
};

export default async function OpenSuqHomePage() {
  const [categories, featuredProducts, recentProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getRecentProducts(8),
  ]);

  const featuredBook = featuredProducts.find(p => p.bookDetails !== null) || recentProducts.find(p => p.bookDetails !== null);

  return (
    <div className="suq-page-wrapper">
      <Navbar />

      <style>{`
        .suq-page-wrapper {
          min-height: 100vh;
          background-color: var(--bg-primary, #f4efe6);
        }

        /* ─── Hero Section ─── */
        .suq-hero {
          background: linear-gradient(180deg, var(--bg-secondary, #ece6dc) 0%, var(--bg-primary, #f4efe6) 100%);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          padding: 4.5rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
        }
        .suq-hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3.5rem;
          align-items: center;
        }
        .suq-badge-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
          background: var(--bg-dark, #121214);
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
        }
        .suq-hero h1 {
          font-family: var(--font-heading, serif);
          font-size: clamp(2.4rem, 5.5vw, 3.8rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }
        .suq-hero h1 span {
          color: var(--accent-primary, #d4a843);
        }
        .suq-hero-desc {
          font-family: var(--font-body, sans-serif);
          font-size: 1.15rem;
          color: var(--text-secondary, #444);
          line-height: 1.8;
          margin-bottom: 2rem;
          max-width: 580px;
        }
        .suq-hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .suq-hero-preview-card {
          background: #ffffff;
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          border-radius: var(--radius-2xl, 2rem);
          padding: 1.25rem;
          box-shadow: 0 20px 48px -12px rgba(0,0,0,0.15), 0 0 28px rgba(212, 168, 67, 0.15);
          position: relative;
        }
        .suq-hero-preview-img {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          border-radius: var(--radius-xl, 1.5rem);
          display: block;
        }
        .suq-hero-preview-badge {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }

        /* ─── Pillars Bar ─── */
        .suq-pillars {
          background: var(--bg-dark, #121214);
          color: var(--text-on-dark, #f4efe6);
          padding: 1.75rem 1.5rem;
          border-bottom: 1px solid var(--border-dark, rgba(255,255,255,0.09));
        }
        .suq-pillars-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .suq-pillar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .suq-pillar-icon {
          font-size: 1.75rem;
          color: var(--accent-primary, #d4a843);
          flex-shrink: 0;
        }
        .suq-pillar-title {
          font-family: var(--font-heading, serif);
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }
        .suq-pillar-sub {
          font-size: 0.8rem;
          color: var(--text-on-dark-muted, #8a8479);
          line-height: 1.4;
        }

        /* ─── Common Section ─── */
        .suq-section {
          padding: 4.5rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .suq-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }
        .suq-section-title-wrap h2 {
          font-family: var(--font-heading, serif);
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }
        .suq-section-title-wrap p {
          color: var(--text-secondary, #444);
          font-size: 1rem;
          max-width: 540px;
        }
        .suq-section-link {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-primary, #d4a843);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: gap 0.2s ease;
        }
        .suq-section-link:hover {
          gap: 0.6rem;
        }

        /* ─── Categories Grid ─── */
        .suq-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .suq-cat-card {
          position: relative;
          border-radius: var(--radius-xl, 1.25rem);
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem;
          text-decoration: none;
          color: #ffffff;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .suq-cat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
        }
        .suq-cat-card-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          z-index: 1;
        }
        .suq-cat-card:hover .suq-cat-card-bg {
          transform: scale(1.06);
        }
        .suq-cat-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(18,18,20,0.15) 0%, rgba(18,18,20,0.85) 100%);
          z-index: 2;
        }
        .suq-cat-card-content {
          position: relative;
          z-index: 3;
        }
        .suq-cat-card-icon {
          font-size: 1.5rem;
          margin-bottom: 0.35rem;
        }
        .suq-cat-card-title {
          font-family: var(--font-heading, serif);
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 0.25rem;
          color: #ffffff;
        }
        .suq-cat-card-count {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
        }

        /* ─── Product Grid ─── */
        .suq-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 2rem;
        }

        /* ─── Book Spotlight Banner ─── */
        .suq-book-spotlight {
          background: var(--bg-dark, #121214);
          border-radius: var(--radius-2xl, 2rem);
          overflow: hidden;
          margin: 2rem auto;
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          display: grid;
          grid-template-columns: 1fr 1fr;
          box-shadow: 0 24px 64px -12px rgba(0,0,0,0.4);
        }
        .suq-spotlight-content {
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .suq-spotlight-tag {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
          margin-bottom: 1rem;
        }
        .suq-spotlight-title {
          font-family: var(--font-heading, serif);
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          color: var(--text-on-dark, #f4efe6);
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .suq-spotlight-desc {
          font-size: 1rem;
          color: var(--text-on-dark-secondary, #c5bfb4);
          line-height: 1.75;
          margin-bottom: 1.75rem;
        }
        .suq-spotlight-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.25rem;
          background: var(--bg-dark-secondary, #1a1a1e);
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--border-dark, rgba(255,255,255,0.08));
        }
        .suq-spec-item {
          display: flex;
          flex-direction: column;
        }
        .suq-spec-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-on-dark-muted, #8a8479);
          font-family: var(--font-mono, sans-serif);
        }
        .suq-spec-val {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-on-dark, #f4efe6);
        }
        .suq-spotlight-media {
          position: relative;
          min-height: 420px;
          background: var(--bg-dark-tertiary, #222227);
        }
        .suq-spotlight-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ─── Newsletter Banner ─── */
        .suq-newsletter-banner {
          background: linear-gradient(135deg, var(--bg-secondary, #ece6dc), var(--bg-primary, #f4efe6));
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          border-radius: var(--radius-2xl, 2rem);
          padding: 3.5rem 2.5rem;
          text-align: center;
          margin: 3rem auto;
          max-width: 1100px;
        }
        .suq-newsletter-banner h3 {
          font-family: var(--font-heading, serif);
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary, #121214);
        }
        .suq-newsletter-banner p {
          color: var(--text-secondary, #444);
          font-size: 1.05rem;
          max-width: 520px;
          margin: 0 auto 2rem;
        }
        .suq-newsletter-form {
          display: flex;
          max-width: 480px;
          margin: 0 auto;
          gap: 0.5rem;
        }
        .suq-newsletter-input {
          flex: 1;
          padding: 0.85rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: #ffffff;
          font-size: 0.95rem;
          color: var(--text-primary, #121214);
        }

        /* ─── Footer ─── */
        .suq-footer {
          background: var(--bg-dark, #121214);
          color: var(--text-on-dark, #f4efe6);
          padding: 4rem 1.5rem 2.5rem;
          border-top: 1px solid var(--border-dark, rgba(255,255,255,0.09));
        }
        .suq-footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3.5rem;
        }
        .suq-footer-brand h4 {
          font-family: var(--font-heading, serif);
          font-size: 1.6rem;
          color: var(--accent-primary, #d4a843);
          margin-bottom: 0.75rem;
        }
        .suq-footer-brand p {
          color: var(--text-on-dark-muted, #8a8479);
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 340px;
        }
        .suq-footer-col h5 {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-on-dark, #f4efe6);
          margin-bottom: 1.25rem;
        }
        .suq-footer-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .suq-footer-col a {
          color: var(--text-on-dark-muted, #8a8479);
          font-size: 0.88rem;
          transition: color 0.15s ease;
        }
        .suq-footer-col a:hover {
          color: var(--accent-primary, #d4a843);
        }
        .suq-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid var(--border-dark, rgba(255,255,255,0.08));
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-on-dark-muted, #8a8479);
        }

        @media (max-width: 900px) {
          .suq-hero-container { grid-template-columns: 1fr; gap: 2rem; }
          .suq-book-spotlight { grid-template-columns: 1fr; }
          .suq-spotlight-content { padding: 2.5rem 1.5rem; }
          .suq-footer-container { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .suq-newsletter-form { flex-direction: column; }
          .suq-footer-container { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>

      {/* ─── Hero Section ─── */}
      <section className="suq-hero">
        <div className="suq-hero-container">
          <div>
            <div className="suq-badge-brand">
              <span>✦</span> Open Suq · Marketplace of Open Knowledge Space
            </div>
            <h1>
              Meaningful Islamic Lifestyle &amp; <span>Print-on-Demand</span>
            </h1>
            <p className="suq-hero-desc">
              Discover published books, children&apos;s educational literature, bespoke Arabic typography apparel, and museum-quality wall art. Thoughtfully crafted and shipped internationally directly from master craft print labs.
            </p>
            <div className="suq-hero-actions">
              <a href="#categories" className="almaghrib-pill-btn">
                Explore Collections →
              </a>
              <Link
                href="/suq/c/books-publications"
                className="filter-btn"
                style={{ padding: '0.85rem 1.8rem', background: '#ffffff' }}
              >
                Browse Books
              </Link>
            </div>
          </div>

          <div className="suq-hero-preview-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80"
              alt="Open Suq Fine Books and Prints"
              className="suq-hero-preview-img"
            />
            <div className="suq-hero-preview-badge">
              🌍 International Shipping Available
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pillars Bar ─── */}
      <section className="suq-pillars" aria-label="Open Suq Guarantees">
        <div className="suq-pillars-container">
          <div className="suq-pillar-item">
            <div className="suq-pillar-icon">📦</div>
            <div>
              <div className="suq-pillar-title">Print-on-Demand Fulfilment</div>
              <div className="suq-pillar-sub">Manufactured with Prodigi global print labs</div>
            </div>
          </div>
          <div className="suq-pillar-item">
            <div className="suq-pillar-icon">🔒</div>
            <div>
              <div className="suq-pillar-title">Secure Checkout</div>
              <div className="suq-pillar-sub">Powered by Paystack with Ghana MoMo &amp; Cards</div>
            </div>
          </div>
          <div className="suq-pillar-item">
            <div className="suq-pillar-icon">🌿</div>
            <div>
              <div className="suq-pillar-title">Sustainable &amp; Mindful</div>
              <div className="suq-pillar-sub">Archival papers, organic cotton &amp; zero waste</div>
            </div>
          </div>
          <div className="suq-pillar-item">
            <div className="suq-pillar-icon">✈️</div>
            <div>
              <div className="suq-pillar-title">Delivered Internationally</div>
              <div className="suq-pillar-sub">Fast dispatch to Ghana, UK, US, Canada &amp; Europe</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Categories ─── */}
      <section id="categories" className="suq-section">
        <div className="suq-section-header">
          <div className="suq-section-title-wrap">
            <h2>Marketplace Categories</h2>
            <p>Carefully curated for Muslim families, students, educators, and cultural connoisseurs.</p>
          </div>
        </div>

        <div className="suq-categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} href={`/suq/c/${cat.slug}`} className="suq-cat-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="suq-cat-card-bg"
              />
              <div className="suq-cat-card-overlay" />
              <div className="suq-cat-card-content">
                <div className="suq-cat-card-icon">{cat.icon || '🛍️'}</div>
                <div className="suq-cat-card-title">{cat.name}</div>
                <div className="suq-cat-card-count">
                  {cat.subcategories.length > 0 ? `${cat.subcategories.length} Collections` : 'Explore →'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Bestsellers ─── */}
      <section className="suq-section" style={{ paddingTop: 0 }}>
        <div className="suq-section-header">
          <div className="suq-section-title-wrap">
            <h2>Featured Products &amp; Bestsellers</h2>
            <p>Our most cherished Islamic lifestyle items, printed to order with precision.</p>
          </div>
        </div>

        <div className="suq-products-grid">
          {featuredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ─── Book Spotlight ─── */}
      {featuredBook && (
        <section className="suq-section" style={{ paddingTop: 0 }}>
          <div className="suq-book-spotlight">
            <div className="suq-spotlight-content">
              <div className="suq-spotlight-tag">📖 Featured Publication Spotlight</div>
              <h2 className="suq-spotlight-title">{featuredBook.title}</h2>
              <p className="suq-spotlight-desc">{featuredBook.description}</p>

              {featuredBook.bookDetails && (
                <div className="suq-spotlight-specs">
                  {featuredBook.bookDetails.author && (
                    <div className="suq-spec-item">
                      <span className="suq-spec-label">Author</span>
                      <span className="suq-spec-val">{featuredBook.bookDetails.author}</span>
                    </div>
                  )}
                  {featuredBook.bookDetails.binding && (
                    <div className="suq-spec-item">
                      <span className="suq-spec-label">Binding</span>
                      <span className="suq-spec-val">{featuredBook.bookDetails.binding}</span>
                    </div>
                  )}
                  {featuredBook.bookDetails.pages && (
                    <div className="suq-spec-item">
                      <span className="suq-spec-label">Pages</span>
                      <span className="suq-spec-val">{featuredBook.bookDetails.pages} pages</span>
                    </div>
                  )}
                  {featuredBook.bookDetails.dimensions && (
                    <div className="suq-spec-item">
                      <span className="suq-spec-label">Dimensions</span>
                      <span className="suq-spec-val">{featuredBook.bookDetails.dimensions}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Link href={`/suq/p/${featuredBook.slug}`} className="almaghrib-pill-btn">
                  View Book Details &amp; Editions →
                </Link>
              </div>
            </div>

            <div className="suq-spotlight-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredBook.primaryImage}
                alt={featuredBook.title}
                className="suq-spotlight-img"
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── All Recent Catalogue Arrivals ─── */}
      <section className="suq-section" style={{ paddingTop: 0 }}>
        <div className="suq-section-header">
          <div className="suq-section-title-wrap">
            <h2>New Arrivals</h2>
            <p>Fresh additions from our design studio and educational team.</p>
          </div>
        </div>

        <div className="suq-products-grid">
          {recentProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ─── Newsletter Banner ─── */}
      <section className="suq-section" style={{ paddingTop: 0 }}>
        <div className="suq-newsletter-banner">
          <span className="almaghrib-tag" style={{ marginBottom: '0.75rem' }}>Stay Connected</span>
          <h3>Join the Open Suq Community</h3>
          <p>
            Receive exclusive announcements for new book launches, Arabic art collections, seasonal promotions, and educational releases.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="suq-footer">
        <div className="suq-footer-container">
          <div className="suq-footer-brand">
            <h4>OPEN SUQ</h4>
            <p>
              The international e-commerce marketplace of <strong>Open Knowledge Space</strong>. Dedicated to premium Islamic lifestyle merchandise, published books, Arabic calligraphy, and educational resources.
            </p>
          </div>

          <div className="suq-footer-col">
            <h5>Categories</h5>
            <ul>
              <li><Link href="/suq/c/books-publications">Books &amp; Publications</Link></li>
              <li><Link href="/suq/c/clothing-apparel">Clothing &amp; Apparel</Link></li>
              <li><Link href="/suq/c/wall-art-decor">Wall Art &amp; Decor</Link></li>
              <li><Link href="/suq/c/accessories-merchandise">Accessories</Link></li>
              <li><Link href="/suq/c/stationery-educational-materials">Educational Stationery</Link></li>
            </ul>
          </div>

          <div className="suq-footer-col">
            <h5>Parent Platform</h5>
            <ul>
              <li><Link href="/">Open Knowledge Space</Link></li>
              <li><Link href="/courses">Courses &amp; LMS</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/blog">Blog &amp; Articles</Link></li>
            </ul>
          </div>

          <div className="suq-footer-col">
            <h5>Support &amp; Trust</h5>
            <ul>
              <li><span>Fulfilment: Prodigi Print API</span></li>
              <li><span>Payments: Paystack Gateway</span></li>
              <li><span>Currency: GHS (Int&apos;l Cards Accepted)</span></li>
              <li><Link href="/login">Customer Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="suq-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Open Suq · Open Knowledge Space. All rights reserved.
          </div>
          <div>
            Designed with the AlMaghrib aesthetic &middot; Manufactured on demand worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
}
