'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/suq/currency';
import { SuqProductWithDetails } from '@/lib/suq/products';

export default function ProductCard({ product }: { product: SuqProductWithDetails }) {
  const { currency, addItem, openCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const isBook = product.categorySlug?.includes('book') || product.bookDetails !== null;
  const hasMultipleVariants = product.variants.length > 1;
  const defaultVariant = product.variants[0];

  // Calculate discount percentage if compareAtPrice is provided
  const startingNum = parseFloat(product.startingPrice || '0');
  const compareNum = product.compareAtPrice ? parseFloat(product.compareAtPrice) : 0;
  const discountPercent = compareNum > startingNum
    ? Math.round(((compareNum - startingNum) / compareNum) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVariant) return;

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      title: product.title,
      variantTitle: defaultVariant.title,
      slug: product.slug,
      price: defaultVariant.retailPrice,
      image: product.primaryImage,
      sku: defaultVariant.sku,
      podSku: defaultVariant.podSku ?? undefined,
      quantity: 1,
    });

    setJustAdded(true);
    openCart();
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article className="suq-product-card">
      <style>{`
        .suq-product-card {
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-xl, 1rem);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
          position: relative;
        }
        .suq-product-card:hover {
          transform: translateY(-5px);
          border-color: var(--gold-border, rgba(212, 168, 67, 0.45));
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 0 24px rgba(212, 168, 67, 0.15);
        }
        .suq-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--bg-secondary, #ece6dc);
          display: block;
        }
        .suq-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .suq-product-card:hover .suq-card-img {
          transform: scale(1.06);
        }
        .suq-badge-stack {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          z-index: 2;
        }
        .suq-card-badge {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .suq-card-hot-badge {
          background: #dc2626;
          color: #ffffff;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }
        .suq-card-sale-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #d4a843;
          color: #121214;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.22rem 0.6rem;
          border-radius: 9999px;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .suq-card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0.45rem;
        }
        .suq-card-cat-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .suq-card-cat {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
        }
        .suq-card-stock-dot {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #059669;
        }
        .suq-stock-indicator {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
        .suq-card-title {
          font-family: var(--font-heading, serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary, #121214);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
          min-height: 2.7rem;
        }
        .suq-card-rating {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          color: var(--text-secondary, #666);
        }
        .suq-card-stars {
          color: #d4a843;
          letter-spacing: 1px;
          font-size: 0.82rem;
        }
        .suq-card-footer {
          margin-top: auto;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle, rgba(0,0,0,0.06));
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .suq-card-price-wrap {
          display: flex;
          flex-direction: column;
        }
        .suq-card-price-prefix {
          font-size: 0.68rem;
          color: var(--text-muted, #74747c);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .suq-card-price {
          font-family: var(--font-mono, sans-serif);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary, #121214);
        }
        .suq-card-compare-price {
          font-size: 0.78rem;
          color: var(--text-muted, #74747c);
          text-decoration: line-through;
          margin-left: 0.35rem;
        }
        .suq-card-actions {
          display: flex;
          gap: 0.35rem;
          align-items: center;
        }
        .suq-card-quick-add-btn {
          padding: 0.45rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid var(--accent-primary, #d4a843);
          background: var(--accent-primary, #d4a843);
          color: #121214;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }
        .suq-card-quick-add-btn:hover {
          background: #c39634;
          transform: scale(1.02);
        }
        .suq-card-view-btn {
          padding: 0.45rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: var(--bg-secondary, #ece6dc);
          color: var(--text-primary, #121214);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .suq-card-view-btn:hover {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
        }
      `}</style>

      <Link href={`/suq/p/${product.slug}`} className="suq-card-image-wrap" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.primaryImage}
          alt={product.title}
          className="suq-card-img"
          loading="lazy"
        />

        <div className="suq-badge-stack">
          {isBook ? (
            <span className="suq-card-badge">📖 Book</span>
          ) : product.categorySlug?.includes('art') ? (
            <span className="suq-card-badge">🎨 Wall Art</span>
          ) : product.categorySlug?.includes('apparel') || product.categorySlug?.includes('cloth') ? (
            <span className="suq-card-badge">👕 Apparel</span>
          ) : (
            <span className="suq-card-badge">✦ Artisan</span>
          )}
          {product.isFeatured && <span className="suq-card-hot-badge">🔥 Bestseller</span>}
        </div>

        {discountPercent > 0 && (
          <span className="suq-card-sale-badge">
            -{discountPercent}%
          </span>
        )}
      </Link>

      <div className="suq-card-content">
        <div className="suq-card-cat-wrap">
          <span className="suq-card-cat">{product.categoryName || 'Catalogue Item'}</span>
          <span className="suq-card-stock-dot">
            <span className="suq-stock-indicator" />
            In Stock
          </span>
        </div>

        <Link href={`/suq/p/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3 className="suq-card-title">{product.title}</h3>
        </Link>

        {/* Psychological Social Proof Rating */}
        <div className="suq-card-rating">
          <span className="suq-card-stars">★★★★★</span>
          <span>4.9 (42)</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: '#059669', fontSize: '0.68rem' }}>Fast Dispatch</span>
        </div>

        <div className="suq-card-footer">
          <div className="suq-card-price-wrap">
            {hasMultipleVariants && <span className="suq-card-price-prefix">From</span>}
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="suq-card-price">
                {formatCurrency(product.startingPrice, currency)}
              </span>
              {product.compareAtPrice && (
                <span className="suq-card-compare-price">
                  {formatCurrency(product.compareAtPrice, currency)}
                </span>
              )}
            </div>
          </div>

          <div className="suq-card-actions">
            <button
              onClick={handleQuickAdd}
              className="suq-card-quick-add-btn"
              title="Add to shopping bag instantly"
            >
              {justAdded ? '✓ Added' : '+ Add'}
            </button>
            <Link
              href={`/suq/p/${product.slug}`}
              className="suq-card-view-btn"
              title="View full specs and editions"
            >
              {hasMultipleVariants ? 'Options' : 'View'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
