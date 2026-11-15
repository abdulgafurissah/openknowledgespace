'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/suq/currency';
import { SuqProductWithDetails } from '@/lib/suq/products';

export default function ProductCard({ product }: { product: SuqProductWithDetails }) {
  const { currency } = useCart();

  const isBook = product.categorySlug?.includes('book') || product.bookDetails !== null;
  const hasVariants = product.variants.length > 1;

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
          border-color: var(--gold-border, rgba(212, 168, 67, 0.4));
          box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.1), 0 0 20px rgba(212, 168, 67, 0.12);
        }
        .suq-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--bg-secondary, #ece6dc);
        }
        .suq-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .suq-product-card:hover .suq-card-img {
          transform: scale(1.05);
        }
        .suq-card-badge {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .suq-card-sale-badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          background: #ef4444;
          color: #ffffff;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          z-index: 2;
        }
        .suq-card-content {
          padding: 1.35rem 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0.5rem;
        }
        .suq-card-cat {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
        }
        .suq-card-title {
          font-family: var(--font-heading, serif);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary, #121214);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .suq-card-author {
          font-size: 0.82rem;
          color: var(--text-secondary, #444);
          font-style: italic;
        }
        .suq-card-footer {
          margin-top: auto;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle, rgba(0,0,0,0.06));
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .suq-card-price-wrap {
          display: flex;
          flex-direction: column;
        }
        .suq-card-price-prefix {
          font-size: 0.7rem;
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
          font-size: 0.8rem;
          color: var(--text-muted, #74747c);
          text-decoration: line-through;
          margin-left: 0.4rem;
        }
        .suq-card-cta-btn {
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          border: 1.5px solid var(--border-color, rgba(0,0,0,0.15));
          background: var(--bg-secondary, #ece6dc);
          color: var(--text-primary, #121214);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .suq-product-card:hover .suq-card-cta-btn {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          border-color: var(--bg-dark, #121214);
        }
      `}</style>

      <Link href={`/suq/p/${product.slug}`} className="suq-card-image-wrap" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.primaryImage} alt={product.title} className="suq-card-img" loading="lazy" />
        {isBook && <span className="suq-card-badge">📖 Book</span>}
        {product.compareAtPrice && <span className="suq-card-sale-badge">SALE</span>}
      </Link>

      <div className="suq-card-content">
        {product.categoryName && (
          <span className="suq-card-cat">{product.categoryName}</span>
        )}

        <Link href={`/suq/p/${product.slug}`}>
          <h3 className="suq-card-title">{product.title}</h3>
        </Link>

        {product.bookDetails?.author && (
          <div className="suq-card-author">by {product.bookDetails.author}</div>
        )}

        <div className="suq-card-footer">
          <div className="suq-card-price-wrap">
            {hasVariants && <span className="suq-card-price-prefix">From</span>}
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

          <Link href={`/suq/p/${product.slug}`} className="suq-card-cta-btn">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
