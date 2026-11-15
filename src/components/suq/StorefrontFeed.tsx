'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SuqProductWithDetails } from '@/lib/suq/products';

interface StorefrontFeedProps {
  products: SuqProductWithDetails[];
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  }[];
}

export default function StorefrontFeed({ products, categories }: StorefrontFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory =
          p.categorySlug === selectedCategory ||
          p.categoryId === selectedCategory ||
          p.categoryName?.toLowerCase().includes(selectedCategory.replace(/-/g, ' '));
        if (!matchesCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchAuthor = p.bookDetails?.author?.toLowerCase().includes(q);
        const matchCat = p.categoryName?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchAuthor || matchCat;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="suq-feed-wrapper">
      <style>{`
        .suq-feed-wrapper {
          width: 100%;
        }

        /* ─── Social Proof / Urgency Ticker ─── */
        .suq-feed-ticker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: #ffffff;
          border: 1px solid var(--border-gold, rgba(212, 168, 67, 0.35));
          border-radius: var(--radius-xl, 1rem);
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 14px rgba(212, 168, 67, 0.08);
        }
        .suq-ticker-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-primary, #121214);
          font-weight: 600;
        }
        .suq-ticker-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
          animation: pulseGreen 2s infinite;
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        .suq-ticker-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.78rem;
          color: var(--text-secondary, #555);
        }
        .suq-ticker-highlight {
          color: var(--accent-primary, #d4a843);
          font-weight: 700;
        }

        /* ─── Header & Controls ─── */
        .suq-feed-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .suq-feed-heading h2 {
          font-family: var(--font-heading, serif);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          margin-bottom: 0.35rem;
          line-height: 1.2;
        }
        .suq-feed-heading p {
          font-size: 0.95rem;
          color: var(--text-secondary, #444);
          margin: 0;
        }
        .suq-feed-search-wrap {
          position: relative;
          min-width: 240px;
          flex: 1;
          max-width: 320px;
        }
        .suq-feed-search {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.2rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: #ffffff;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .suq-feed-search:focus {
          border-color: var(--accent-primary, #d4a843);
          box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.15);
        }
        .suq-feed-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #888);
          font-size: 0.85rem;
          pointer-events: none;
        }

        /* ─── Category Filter Pills Bar (Horizontal scroll on mobile) ─── */
        .suq-filter-pills-bar {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.75rem;
          margin-bottom: 1.75rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .suq-filter-pills-bar::-webkit-scrollbar {
          display: none;
        }
        .suq-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.15rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.12));
          background: #ffffff;
          color: var(--text-secondary, #444);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .suq-pill-btn:hover {
          color: var(--text-primary, #121214);
          border-color: var(--accent-primary, #d4a843);
          transform: translateY(-1px);
        }
        .suq-pill-btn.active {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          border-color: var(--bg-dark, #121214);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .suq-pill-count {
          font-size: 0.68rem;
          opacity: 0.75;
        }

        /* ─── Grid ─── */
        .suq-feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.75rem;
        }

        /* ─── Empty State ─── */
        .suq-feed-empty {
          background: #ffffff;
          border-radius: var(--radius-xl, 1rem);
          border: 1px dashed var(--border-color, rgba(0,0,0,0.15));
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-secondary, #555);
        }
        .suq-feed-empty h3 {
          font-family: var(--font-heading, serif);
          font-size: 1.4rem;
          color: var(--text-primary, #121214);
          margin-bottom: 0.5rem;
        }

        @media (max-width: 640px) {
          .suq-feed-ticker {
            flex-direction: column;
            align-items: flex-start;
          }
          .suq-feed-search-wrap {
            max-width: 100%;
          }
          .suq-feed-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1.25rem;
          }
        }
      `}</style>

      {/* Psychology Urgency & Trust Ticker */}
      <div className="suq-feed-ticker">
        <div className="suq-ticker-left">
          <span className="suq-ticker-live-dot" />
          <span>In-Stock Drops · Ready for Same-Day Packaging</span>
        </div>
        <div className="suq-ticker-right">
          <span>★ <strong className="suq-ticker-highlight">4.9/5 Rating</strong> (250+ Families)</span>
          <span>⚡ <strong className="suq-ticker-highlight">Ghana MoMo</strong> &amp; Cards</span>
          <span>🛡️ <strong className="suq-ticker-highlight">100% Quality Guarantee</strong></span>
        </div>
      </div>

      {/* Heading & Fast Search */}
      <div className="suq-feed-header">
        <div className="suq-feed-heading">
          <h2>⚡ New Arrivals &amp; Available Items</h2>
          <p>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available · Handcrafted with master print craft
          </p>
        </div>

        <div className="suq-feed-search-wrap">
          <span className="suq-feed-search-icon">🔍</span>
          <input
            type="text"
            className="suq-feed-search"
            placeholder="Search items by title, author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Pills (Instant One-Tap on Mobile & Desktop) */}
      <div className="suq-filter-pills-bar" role="tablist" aria-label="Product categories">
        <button
          className={`suq-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span>🔥 All Items</span>
          <span className="suq-pill-count">({products.length})</span>
        </button>

        {categories.map(cat => {
          const count = products.filter(
            p => p.categorySlug === cat.slug || p.categoryId === cat.id
          ).length;

          return (
            <button
              key={cat.id}
              className={`suq-pill-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              <span>{cat.icon || '✦'}</span>
              <span>{cat.name}</span>
              {count > 0 && <span className="suq-pill-count">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Products Feed */}
      {filteredProducts.length === 0 ? (
        <div className="suq-feed-empty">
          <h3>No items matched your search</h3>
          <p>Try searching for a different keyword or view all available items.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="almaghrib-pill-btn"
            style={{ marginTop: '1rem', display: 'inline-block' }}
          >
            Show All Available Items
          </button>
        </div>
      ) : (
        <div className="suq-feed-grid">
          {filteredProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
