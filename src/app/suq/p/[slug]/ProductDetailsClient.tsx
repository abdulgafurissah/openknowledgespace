'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/suq/currency';
import { SuqProductWithDetails } from '@/lib/suq/products';

export default function ProductDetailsClient({ product }: { product: SuqProductWithDetails }) {
  const router = useRouter();
  const { addItem, currency } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || ''
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeSamplePage, setActiveSamplePage] = useState<string | null>(null);

  const activeVariant =
    product.variants.find(v => v.id === selectedVariantId) ||
    product.variants[0];

  const currentPrice = activeVariant ? activeVariant.retailPrice : product.startingPrice;
  const currentCompareAt = activeVariant?.compareAtPrice || product.compareAtPrice;

  const images = product.images.length > 0
    ? product.images.map(i => i.url)
    : [product.primaryImage];

  const isBook = product.categorySlug?.includes('book') || product.bookDetails !== null;
  const book = product.bookDetails;

  const handleAddToCart = () => {
    if (!activeVariant) return;
    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      title: product.title,
      variantTitle: activeVariant.title,
      slug: product.slug,
      price: activeVariant.retailPrice,
      image: images[selectedImageIndex] || product.primaryImage,
      sku: activeVariant.sku,
      podSku: activeVariant.podSku || undefined,
      weightGrams: activeVariant.weightGrams || undefined,
      quantity,
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/suq/checkout');
  };

  return (
    <>
      <style>{`
        .pdp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
        }
        .pdp-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted, #74747c);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2rem;
        }
        .pdp-breadcrumbs a {
          color: var(--text-secondary, #444);
        }
        .pdp-breadcrumbs a:hover {
          color: var(--accent-primary, #d4a843);
        }
        .pdp-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3.5rem;
          align-items: start;
        }

        /* ─── Gallery ─── */
        .pdp-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pdp-main-image-wrap {
          width: 100%;
          aspect-ratio: 1;
          background: #ffffff;
          border-radius: var(--radius-2xl, 1.5rem);
          overflow: hidden;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          box-shadow: var(--shadow-md, 0 6px 20px -3px rgba(0,0,0,0.08));
          position: relative;
        }
        .pdp-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pdp-thumbnails {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .pdp-thumb-btn {
          width: 76px;
          height: 76px;
          border-radius: var(--radius-md, 10px);
          overflow: hidden;
          border: 2px solid transparent;
          background: #ffffff;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .pdp-thumb-btn.active {
          border-color: var(--accent-primary, #d4a843);
          box-shadow: 0 0 12px rgba(212, 168, 67, 0.35);
        }
        .pdp-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ─── Details Info ─── */
        .pdp-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .pdp-category-tag {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent-primary, #d4a843);
        }
        .pdp-title {
          font-family: var(--font-heading, serif);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          color: var(--text-primary, #121214);
          line-height: 1.2;
          margin: 0;
        }
        .pdp-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .pdp-price-main {
          font-family: var(--font-mono, sans-serif);
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary, #121214);
        }
        .pdp-compare-price {
          font-family: var(--font-mono, sans-serif);
          font-size: 1.15rem;
          color: var(--text-muted, #74747c);
          text-decoration: line-through;
        }
        .pdp-sale-pill {
          background: #ef4444;
          color: #ffffff;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .pdp-desc {
          color: var(--text-secondary, #444);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        /* ─── Variants ─── */
        .pdp-variants-section {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .pdp-variant-label {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-primary, #121214);
        }
        .pdp-variant-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .pdp-variant-chip {
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          border: 1.5px solid var(--border-color, rgba(0,0,0,0.15));
          background: #ffffff;
          color: var(--text-primary, #121214);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-variant-chip:hover {
          border-color: var(--accent-primary, #d4a843);
        }
        .pdp-variant-chip.active {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          border-color: var(--bg-dark, #121214);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* ─── Quantity & Action Buttons ─── */
        .pdp-action-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .pdp-qty-control {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid var(--border-color, rgba(0,0,0,0.15));
          border-radius: 9999px;
          background: #ffffff;
          overflow: hidden;
        }
        .pdp-qty-btn {
          background: transparent;
          border: none;
          width: 38px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          color: var(--text-primary, #121214);
        }
        .pdp-qty-btn:hover {
          background: var(--bg-secondary, #ece6dc);
        }
        .pdp-qty-val {
          width: 36px;
          text-align: center;
          font-family: var(--font-mono, sans-serif);
          font-weight: 700;
          font-size: 0.95rem;
        }
        .pdp-btn-add {
          flex: 1;
          padding: 0.9rem 1.8rem;
          border-radius: 9999px;
          border: none;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-width: 170px;
        }
        .pdp-btn-add:hover {
          background: var(--accent-primary, #d4a843);
          color: var(--bg-dark, #121214);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 168, 67, 0.35);
        }
        .pdp-btn-buy {
          padding: 0.9rem 1.8rem;
          border-radius: 9999px;
          border: 1.5px solid var(--accent-primary, #d4a843);
          background: transparent;
          color: var(--accent-primary, #d4a843);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-btn-buy:hover {
          background: var(--accent-primary, #d4a843);
          color: var(--bg-dark, #121214);
        }

        /* ─── Fulfilment & Shipping Trust Badge ─── */
        .pdp-trust-box {
          background: var(--bg-secondary, #ece6dc);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-xl, 1rem);
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pdp-trust-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.88rem;
          color: var(--text-secondary, #444);
        }
        .pdp-trust-icon {
          font-size: 1.1rem;
          line-height: 1.2;
        }

        /* ─── Book Specifications Grid ─── */
        .pdp-book-specs-card {
          margin-top: 3.5rem;
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-2xl, 1.5rem);
          padding: 2.5rem;
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
        }
        .pdp-book-specs-card h3 {
          font-family: var(--font-heading, serif);
          font-size: 1.6rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary, #121214);
        }
        .pdp-book-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .pdp-spec-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pdp-spec-cell-label {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted, #74747c);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .pdp-spec-cell-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary, #121214);
        }
        .pdp-sample-pages {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-subtle, rgba(0,0,0,0.06));
        }
        .pdp-sample-pages-title {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent-primary, #d4a843);
          margin-bottom: 1rem;
        }
        .pdp-sample-thumbs {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
        }
        .pdp-sample-thumb {
          width: 140px;
          height: 100px;
          border-radius: var(--radius-md, 8px);
          object-fit: cover;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .pdp-sample-thumb:hover {
          transform: scale(1.04);
        }

        /* ─── Sample Modal ─── */
        .pdp-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .pdp-modal-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 12px 48px rgba(0,0,0,0.5);
        }
        .pdp-modal-close {
          position: absolute;
          top: 1.5rem;
          right: 2rem;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 2.2rem;
          cursor: pointer;
        }

        @media (max-width: 840px) {
          .pdp-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>

      <div className="pdp-container">
        {/* Breadcrumbs */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/suq">Open Suq</Link>
          <span>/</span>
          {product.categorySlug && (
            <>
              <Link href={`/suq/c/${product.categorySlug}`}>{product.categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span>{product.title}</span>
        </nav>

        <div className="pdp-grid">
          {/* Gallery Column */}
          <div className="pdp-gallery">
            <div className="pdp-main-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImageIndex] || product.primaryImage}
                alt={product.title}
                className="pdp-main-image"
              />
            </div>

            {images.length > 1 && (
              <div className="pdp-thumbnails">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="pdp-thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="pdp-info">
            {product.categoryName && (
              <span className="pdp-category-tag">{product.categoryName}</span>
            )}

            <h1 className="pdp-title">{product.title}</h1>

            {/* Price */}
            <div className="pdp-price-row">
              <span className="pdp-price-main">
                {formatCurrency(currentPrice, currency)}
              </span>
              {currentCompareAt && (
                <span className="pdp-compare-price">
                  {formatCurrency(currentCompareAt, currency)}
                </span>
              )}
              {currentCompareAt && (
                <span className="pdp-sale-pill">Special Offer</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pdp-desc">{product.description}</div>
            )}

            {/* Variants Selector */}
            {product.variants.length > 1 && (
              <div className="pdp-variants-section">
                <span className="pdp-variant-label">
                  Select Edition / Variant: <strong>{activeVariant?.title}</strong>
                </span>
                <div className="pdp-variant-pills">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      className={`pdp-variant-chip ${selectedVariantId === v.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      {v.title} · {formatCurrency(v.retailPrice, currency)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pdp-action-row">
              <div className="pdp-qty-control">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="pdp-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="pdp-btn-add"
                onClick={handleAddToCart}
              >
                <span>🛍️</span> Add to Cart
              </button>

              <button
                type="button"
                className="pdp-btn-buy"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Fulfilment & Shipping Trust Badge */}
            <div className="pdp-trust-box">
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">🖨️</span>
                <div>
                  <strong>Fulfilled by Prodigi Print API:</strong> Manufactured on demand using museum-grade archival pigments, heavyweight canvas, and organic garments.
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">✈️</span>
                <div>
                  <strong>Global Distribution:</strong> Fulfilled from automated print facilities in the UK, Europe, USA, and worldwide hubs for minimal transit times.
                </div>
              </div>
              <div className="pdp-trust-item">
                <span className="pdp-trust-icon">💳</span>
                <div>
                  <strong>Paystack Payment Security:</strong> Direct card processing and Mobile Money with end-to-end server verification.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Specific Specifications Card */}
        {isBook && book && (
          <section className="pdp-book-specs-card" aria-label="Book Specifications">
            <h3>Publication Details &amp; Specifications</h3>
            <div className="pdp-book-specs-grid">
              {book.author && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Author / Editorial</span>
                  <span className="pdp-spec-cell-val">{book.author}</span>
                </div>
              )}
              {book.isbn && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">ISBN</span>
                  <span className="pdp-spec-cell-val">{book.isbn}</span>
                </div>
              )}
              {book.pages && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Number of Pages</span>
                  <span className="pdp-spec-cell-val">{book.pages} pages</span>
                </div>
              )}
              {book.binding && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Binding Type</span>
                  <span className="pdp-spec-cell-val">{book.binding}</span>
                </div>
              )}
              {book.language && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Language</span>
                  <span className="pdp-spec-cell-val">{book.language}</span>
                </div>
              )}
              {book.dimensions && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Dimensions</span>
                  <span className="pdp-spec-cell-val">{book.dimensions}</span>
                </div>
              )}
              {book.ageGroup && (
                <div className="pdp-spec-cell">
                  <span className="pdp-spec-cell-label">Recommended Age</span>
                  <span className="pdp-spec-cell-val">{book.ageGroup}</span>
                </div>
              )}
            </div>

            {/* Sample Pages Preview */}
            {book.samplePages && book.samplePages.length > 0 && (
              <div className="pdp-sample-pages">
                <div className="pdp-sample-pages-title">Sample Pages Preview (Click to Enlarge)</div>
                <div className="pdp-sample-thumbs">
                  {book.samplePages.map((url: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Sample Spread ${i + 1}`}
                      className="pdp-sample-thumb"
                      onClick={() => setActiveSamplePage(url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Sample Modal */}
      {activeSamplePage && (
        <div className="pdp-modal-backdrop" onClick={() => setActiveSamplePage(null)}>
          <button className="pdp-modal-close" onClick={() => setActiveSamplePage(null)}>✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeSamplePage} alt="Sample Page Spread Preview" className="pdp-modal-img" />
        </div>
      )}
    </>
  );
}
