import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewsletterForm from '@/components/suq/NewsletterForm';
import StorefrontFeed from '@/components/suq/StorefrontFeed';
import { getCategories, getFeaturedProducts, getRecentProducts } from '@/lib/suq/products';

export const metadata: Metadata = {
  title: 'Open Suq — The Marketplace of Open Knowledge Space',
  description: 'An international Islamic marketplace for educational books, Arabic calligraphy apparel, minimalist wall art, and thoughtfully designed lifestyle merchandise.',
};

export default async function OpenSuqHomePage() {
  const [categories, featuredProducts, allRecentProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getRecentProducts(24),
  ]);

  const featuredBook =
    featuredProducts.find(p => p.bookDetails !== null) ||
    allRecentProducts.find(p => p.bookDetails !== null);

  return (
    <div className="suq-page-wrapper">
      <Navbar />

      <style>{`
        .suq-page-wrapper {
          min-height: 100vh;
          background-color: var(--bg-primary, #f4efe6);
        }

        /* ─── Top Urgency / Trust Announcement Bar ─── */
        .suq-announcement-bar {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          padding: 0.65rem 1.5rem;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
          border-bottom: 1px solid rgba(212, 168, 67, 0.25);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .suq-announcement-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* ─── Compact Hero Header ─── */
        .suq-hero-compact {
          background: linear-gradient(180deg, var(--bg-secondary, #ece6dc) 0%, var(--bg-primary, #f4efe6) 100%);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          padding: 2.75rem 1.5rem 2rem;
        }
        .suq-hero-compact-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .suq-badge-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
          background: var(--bg-dark, #121214);
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          margin-bottom: 0.85rem;
        }
        .suq-hero-compact h1 {
          font-family: var(--font-heading, serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          line-height: 1.2;
          margin-bottom: 0.6rem;
        }
        .suq-hero-compact h1 span {
          color: var(--accent-primary, #d4a843);
        }
        .suq-hero-compact p {
          font-size: 1.05rem;
          color: var(--text-secondary, #444);
          max-width: 620px;
          line-height: 1.6;
          margin: 0 0 1rem;
        }
        .suq-trust-pills {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .suq-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.1));
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary, #121214);
        }

        /* ─── Main Shopping Container ─── */
        .suq-main-shopping-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 5rem;
        }

        /* ─── Desktop 2-Column: New Arrivals Left (Focus), Categories Right ─── */
        .suq-main-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2.75rem;
          align-items: start;
        }

        .suq-new-arrivals-column {
          width: 100%;
        }

        .suq-categories-column {
          width: 100%;
          position: sticky;
          top: 5rem;
        }

        /* ─── Right Sidebar: Marketplace Categories Card ─── */
        .suq-sidebar-card {
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-xl, 1.25rem);
          overflow: hidden;
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
          margin-bottom: 1.75rem;
        }
        .suq-sidebar-header {
          padding: 1.25rem 1.5rem;
          background: var(--bg-secondary, #ece6dc);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .suq-sidebar-header h3 {
          font-family: var(--font-heading, serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary, #121214);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .suq-sidebar-badge {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--accent-primary, #d4a843);
          background: var(--bg-dark, #121214);
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
        }

        .suq-category-list {
          list-style: none;
          padding: 0.5rem 0;
          margin: 0;
        }
        .suq-category-item-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          text-decoration: none;
          color: var(--text-primary, #121214);
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }
        .suq-category-item-link:last-child {
          border-bottom: none;
        }
        .suq-category-item-link:hover {
          background: var(--bg-secondary, #ece6dc);
          padding-left: 1.5rem;
        }
        .suq-category-item-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .suq-cat-thumb {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          object-fit: cover;
          background: var(--bg-secondary, #ece6dc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .suq-cat-name {
          font-weight: 700;
          font-size: 0.92rem;
          display: block;
        }
        .suq-cat-subs-preview {
          font-size: 0.75rem;
          color: var(--text-muted, #74747c);
          display: block;
          margin-top: 0.15rem;
        }
        .suq-cat-arrow {
          font-size: 1rem;
          color: var(--accent-primary, #d4a843);
          transition: transform 0.2s ease;
        }
        .suq-category-item-link:hover .suq-cat-arrow {
          transform: translateX(4px);
        }

        /* ─── Buyer Psychology Sidebar Widgets ─── */
        .suq-trust-box {
          padding: 1.5rem;
          background: #ffffff;
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          border-radius: var(--radius-xl, 1.25rem);
          margin-bottom: 1.75rem;
          box-shadow: 0 4px 16px rgba(212, 168, 67, 0.08);
        }
        .suq-trust-box-title {
          font-family: var(--font-heading, serif);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-primary, #121214);
        }
        .suq-trust-benefit {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .suq-trust-benefit:last-child {
          margin-bottom: 0;
        }
        .suq-trust-icon {
          font-size: 1.15rem;
          color: var(--accent-primary, #d4a843);
          flex-shrink: 0;
        }
        .suq-trust-benefit-text h5 {
          font-size: 0.82rem;
          font-weight: 700;
          margin: 0 0 0.15rem;
          color: var(--text-primary, #121214);
        }
        .suq-trust-benefit-text p {
          font-size: 0.75rem;
          color: var(--text-secondary, #555);
          margin: 0;
          line-height: 1.4;
        }

        .suq-review-snippet {
          padding: 1.25rem;
          background: var(--bg-dark, #121214);
          color: var(--text-on-dark, #f4efe6);
          border-radius: var(--radius-xl, 1.25rem);
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          margin-bottom: 1.75rem;
        }
        .suq-review-stars {
          color: var(--accent-primary, #d4a843);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          letter-spacing: 2px;
        }
        .suq-review-quote {
          font-size: 0.82rem;
          line-height: 1.5;
          font-style: italic;
          color: var(--text-on-dark-secondary, #c5bfb4);
          margin-bottom: 0.75rem;
        }
        .suq-review-author {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          color: var(--accent-primary, #d4a843);
          font-weight: 700;
        }

        /* ─── Book Spotlight Banner (Below New Arrivals) ─── */
        .suq-book-spotlight {
          background: var(--bg-dark, #121214);
          border-radius: var(--radius-2xl, 2rem);
          overflow: hidden;
          margin: 3.5rem 0 2rem;
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          box-shadow: 0 20px 48px -12px rgba(0,0,0,0.35);
        }
        .suq-spotlight-content {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .suq-spotlight-tag {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
          margin-bottom: 0.75rem;
        }
        .suq-spotlight-title {
          font-family: var(--font-heading, serif);
          font-size: clamp(1.6rem, 3vw, 2.3rem);
          color: var(--text-on-dark, #f4efe6);
          line-height: 1.25;
          margin-bottom: 0.75rem;
        }
        .suq-spotlight-desc {
          font-size: 0.92rem;
          color: var(--text-on-dark-secondary, #c5bfb4);
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }
        .suq-spotlight-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding: 1rem 1.25rem;
          background: var(--bg-dark-secondary, #1a1a1e);
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--border-dark, rgba(255,255,255,0.08));
        }
        .suq-spec-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-on-dark-muted, #8a8479);
          font-family: var(--font-mono, sans-serif);
        }
        .suq-spec-val {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-on-dark, #f4efe6);
        }
        .suq-spotlight-media {
          position: relative;
          min-height: 380px;
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
          padding: 3rem 2rem;
          text-align: center;
          margin: 3.5rem auto 1rem;
          max-width: 1100px;
        }
        .suq-newsletter-banner h3 {
          font-family: var(--font-heading, serif);
          font-size: 2rem;
          margin-bottom: 0.6rem;
          color: var(--text-primary, #121214);
        }
        .suq-newsletter-banner p {
          color: var(--text-secondary, #444);
          font-size: 1rem;
          max-width: 500px;
          margin: 0 auto 1.75rem;
          line-height: 1.6;
        }

        /* ─── Footer ─── */
        .suq-footer {
          background: var(--bg-dark, #121214);
          color: var(--text-on-dark, #f4efe6);
          padding: 4rem 1.5rem 2.5rem;
          border-top: 1px solid var(--border-dark, rgba(255,255,255,0.09));
        }
        .suq-footer-container {
          max-width: 1280px;
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
          font-size: 0.88rem;
          line-height: 1.7;
          max-width: 340px;
        }
        .suq-footer-col h5 {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.78rem;
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
          padding: 0;
          margin: 0;
        }
        .suq-footer-col a {
          color: var(--text-on-dark-muted, #8a8479);
          font-size: 0.88rem;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .suq-footer-col a:hover {
          color: var(--accent-primary, #d4a843);
        }
        .suq-footer-bottom {
          max-width: 1280px;
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

        /* ─── MOBILE RESPONSIVENESS & ORDERING ─── */
        @media (max-width: 960px) {
          .suq-main-layout {
            display: flex;
            flex-direction: column;
          }

          /* CRITICAL REQUIREMENT: On mobile, New Arrivals MUST be at the top! */
          .suq-new-arrivals-column {
            order: 1;
          }

          /* Marketplace Categories placed below on mobile so users see products immediately */
          .suq-categories-column {
            order: 2;
            position: static;
            margin-top: 2.5rem;
          }

          .suq-book-spotlight {
            grid-template-columns: 1fr;
          }
          .suq-spotlight-content {
            padding: 2.25rem 1.5rem;
          }
          .suq-footer-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .suq-announcement-bar {
            font-size: 0.7rem;
            gap: 0.75rem;
          }
          .suq-hero-compact {
            padding: 1.75rem 1rem 1.5rem;
          }
          .suq-footer-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>

      {/* ─── Psychology Announcement Ticker Bar ─── */}
      <aside className="suq-announcement-bar" aria-label="Storewide announcements">
        <span className="suq-announcement-item">
          ✨ <strong>New Season Drop</strong>
        </span>
        <span className="suq-announcement-item">
          🚚 Free Accra Delivery on Orders Over GH₵300
        </span>
        <span className="suq-announcement-item">
          🇬🇭 Local Ghana MoMo &amp; Express Dispatch
        </span>
        <span className="suq-announcement-item">
          🌍 International Courier Shipping
        </span>
      </aside>

      {/* ─── Compact Hero Welcome Header ─── */}
      <header className="suq-hero-compact">
        <div className="suq-hero-compact-container">
          <div>
            <div className="suq-badge-brand">
              <span>✦</span> Open Suq · Marketplace of Open Knowledge Space
            </div>
            <h1>
              Authentic Islamic Lifestyle, Books &amp; <span>Art Prints</span>
            </h1>
            <p>
              Explore published literature, Arabic calligraphy apparel, and museum-grade wall art. Handcrafted to order and shipped directly to your door.
            </p>
            <div className="suq-trust-pills">
              <span className="suq-trust-pill">★ 4.9/5 from 250+ Families</span>
              <span className="suq-trust-pill">✓ Instant MoMo &amp; Cards</span>
              <span className="suq-trust-pill">✓ 100% Print Guarantee</span>
              <span className="suq-trust-pill">✓ Dispatched in 24-48 Hours</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Shopping Area ─── */}
      <main className="suq-main-shopping-section">
        <div className="suq-main-layout">
          {/* 
            LEFT COLUMN (Desktop) / TOP (Mobile): 
            New Arrivals is the MAIN FOCUS with instant interactive filters & zero stress 
          */}
          <section className="suq-new-arrivals-column" aria-label="New Arrivals and Available Products">
            <StorefrontFeed
              products={allRecentProducts}
              categories={categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                icon: c.icon,
              }))}
            />

            {/* Featured Book Spotlight */}
            {featuredBook && (
              <div className="suq-book-spotlight">
                <div className="suq-spotlight-content">
                  <div className="suq-spotlight-tag">📖 Featured Publication Spotlight</div>
                  <h2 className="suq-spotlight-title">{featuredBook.title}</h2>
                  <p className="suq-spotlight-desc">{featuredBook.description}</p>

                  {featuredBook.bookDetails && (
                    <div className="suq-spotlight-specs">
                      {featuredBook.bookDetails.author && (
                        <div>
                          <span className="suq-spec-label">Author</span>
                          <div className="suq-spec-val">{featuredBook.bookDetails.author}</div>
                        </div>
                      )}
                      {featuredBook.bookDetails.binding && (
                        <div>
                          <span className="suq-spec-label">Binding</span>
                          <div className="suq-spec-val">{featuredBook.bookDetails.binding}</div>
                        </div>
                      )}
                      {featuredBook.bookDetails.pages && (
                        <div>
                          <span className="suq-spec-label">Pages</span>
                          <div className="suq-spec-val">{featuredBook.bookDetails.pages} pages</div>
                        </div>
                      )}
                      {featuredBook.bookDetails.dimensions && (
                        <div>
                          <span className="suq-spec-label">Dimensions</span>
                          <div className="suq-spec-val">{featuredBook.bookDetails.dimensions}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Link
                      href={`/suq/p/${featuredBook.slug}`}
                      className="almaghrib-pill-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      View Book &amp; Order Now →
                    </Link>
                  </div>
                </div>

                <div className="suq-spotlight-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredBook.primaryImage}
                    alt={featuredBook.title}
                    className="suq-spotlight-img"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </section>

          {/* 
            RIGHT COLUMN (Desktop) / BOTTOM (Mobile): 
            Marketplace Categories listed at the right side on PC view 
          */}
          <aside className="suq-categories-column" aria-label="Marketplace Categories and Information">
            {/* Categories Navigation Card */}
            <div className="suq-sidebar-card">
              <div className="suq-sidebar-header">
                <h3>🛍️ Marketplace Categories</h3>
                <span className="suq-sidebar-badge">{categories.length} Departments</span>
              </div>

              <ul className="suq-category-list">
                {categories.map(cat => {
                  const subsList = cat.subcategories.slice(0, 3).map(s => s.name).join(', ');
                  return (
                    <li key={cat.id}>
                      <Link href={`/suq/c/${cat.slug}`} className="suq-category-item-link">
                        <div className="suq-category-item-left">
                          <div className="suq-cat-thumb">
                            {cat.icon || '🛍️'}
                          </div>
                          <div>
                            <span className="suq-cat-name">{cat.name}</span>
                            {subsList ? (
                              <span className="suq-cat-subs-preview">{subsList}...</span>
                            ) : (
                              <span className="suq-cat-subs-preview">Browse collection</span>
                            )}
                          </div>
                        </div>
                        <span className="suq-cat-arrow">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Buyer Psychology Trust Box */}
            <div className="suq-trust-box">
              <div className="suq-trust-box-title">
                <span>🛡️</span> The Open Suq Guarantee
              </div>
              <div className="suq-trust-benefit">
                <span className="suq-trust-icon">🌿</span>
                <div className="suq-trust-benefit-text">
                  <h5>Museum-Grade Print Quality</h5>
                  <p>Archival acid-free paper, rich pigment inks &amp; organic cotton.</p>
                </div>
              </div>
              <div className="suq-trust-benefit">
                <span className="suq-trust-icon">⚡</span>
                <div className="suq-trust-benefit-text">
                  <h5>Swift Dispatch to Your Door</h5>
                  <p>Fulfilled locally across Ghana &amp; West Africa, and globally via trusted carriers.</p>
                </div>
              </div>
              <div className="suq-trust-benefit">
                <span className="suq-trust-icon">💳</span>
                <div className="suq-trust-benefit-text">
                  <h5>Instant &amp; Safe Payment</h5>
                  <p>Protected by Paystack with Mobile Money (MTN, Telecel, AT) &amp; international cards.</p>
                </div>
              </div>
            </div>

            {/* Buyer Psychology Verified Review */}
            <div className="suq-review-snippet">
              <div className="suq-review-stars">★★★★★</div>
              <p className="suq-review-quote">
                &ldquo;The print and paper quality of the Prophets book is extraordinary. Prompt delivery right to my doorstep in Accra.&rdquo;
              </p>
              <div className="suq-review-author">
                — Sister Amina K., Verified Buyer (East Legon)
              </div>
            </div>

            {/* Direct Support Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1.25rem',
                fontSize: '0.82rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Need help or bulk ordering?
              </div>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem' }}>
                For school orders, libraries, or customized gift packages, we are always ready to assist.
              </p>
              <Link
                href="/login"
                className="filter-btn"
                style={{
                  display: 'inline-block',
                  padding: '0.45rem 1rem',
                  fontSize: '0.75rem',
                  background: 'var(--bg-secondary)',
                }}
              >
                Sign In to Your Account
              </Link>
            </div>
          </aside>
        </div>

        {/* ─── Newsletter Community Banner ─── */}
        <section className="suq-newsletter-banner" aria-label="Newsletter Subscription">
          <span className="almaghrib-tag" style={{ marginBottom: '0.75rem' }}>Stay Connected</span>
          <h3>Join the Open Suq Community</h3>
          <p>
            Receive announcements for new published literature, calligraphy releases, and exclusive seasonal member drops.
          </p>
          <NewsletterForm />
        </section>
      </main>

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
              <li><span>Local Fulfilment &amp; Prodigi Print</span></li>
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
            Designed with the AlMaghrib aesthetic &middot; Crafted with care.
          </div>
        </div>
      </footer>
    </div>
  );
}
