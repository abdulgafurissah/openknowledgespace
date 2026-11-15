'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatCurrency, CURRENCY_SYMBOLS } from '@/lib/suq/currency';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, currency, setCurrency } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .suq-cart-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 18, 20, 0.65);
          backdrop-filter: blur(4px);
          z-index: 999;
          animation: suqFadeIn 0.2s ease-out;
        }
        .suq-cart-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 440px;
          background: var(--bg-card, #ffffff);
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.25);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: suqSlideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .suq-cart-header {
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-secondary, #ece6dc);
        }
        .suq-cart-header h2 {
          font-family: var(--font-heading, serif);
          font-size: 1.35rem;
          margin: 0;
          color: var(--text-primary, #121214);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .suq-cart-close {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary, #44444a);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm, 6px);
          transition: all 0.15s ease;
        }
        .suq-cart-close:hover {
          color: var(--text-primary, #121214);
          background: rgba(0,0,0,0.05);
        }
        .suq-currency-picker {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-family: var(--font-mono, sans-serif);
          font-weight: 700;
        }
        .suq-currency-btn {
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: #ffffff;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 0.72rem;
          color: var(--text-secondary, #444);
        }
        .suq-currency-btn.active {
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          border-color: var(--bg-dark, #121214);
        }
        .suq-cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .suq-cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-muted, #74747c);
          padding: 3rem 1rem;
        }
        .suq-cart-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06));
        }
        .suq-cart-item-img {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-md, 10px);
          object-fit: cover;
          background: var(--bg-secondary, #ece6dc);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          flex-shrink: 0;
        }
        .suq-cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .suq-cart-item-title {
          font-family: var(--font-heading, serif);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary, #121214);
          line-height: 1.3;
          margin-bottom: 0.2rem;
        }
        .suq-cart-item-variant {
          font-size: 0.78rem;
          color: var(--text-secondary, #444);
          margin-bottom: 0.4rem;
        }
        .suq-cart-item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .suq-cart-qty-ctrl {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          border-radius: 9999px;
          background: var(--bg-secondary, #ece6dc);
          overflow: hidden;
        }
        .suq-cart-qty-btn {
          background: transparent;
          border: none;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
          color: var(--text-primary, #121214);
        }
        .suq-cart-qty-btn:hover {
          background: rgba(0,0,0,0.06);
        }
        .suq-cart-qty-val {
          padding: 0 0.5rem;
          font-size: 0.8rem;
          font-family: var(--font-mono, sans-serif);
          font-weight: 700;
        }
        .suq-cart-item-price {
          font-family: var(--font-mono, sans-serif);
          font-weight: 800;
          color: var(--accent-primary, #d4a843);
          font-size: 0.95rem;
        }
        .suq-cart-remove-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .suq-cart-footer {
          padding: 1.5rem 1.75rem;
          background: var(--bg-secondary, #ece6dc);
          border-top: 1px solid var(--border-color, rgba(0,0,0,0.08));
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .suq-cart-subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .suq-cart-subtotal-label {
          font-size: 0.95rem;
          color: var(--text-secondary, #444);
          font-weight: 500;
        }
        .suq-cart-subtotal-val {
          font-family: var(--font-mono, sans-serif);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary, #121214);
        }
        .suq-cart-checkout-btn {
          width: 100%;
          padding: 1rem;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843) !important;
          border: none;
          border-radius: 9999px;
          font-family: var(--font-mono, sans-serif);
          font-weight: 800;
          font-size: 0.88rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: all 0.2s ease;
          display: block;
        }
        .suq-cart-checkout-btn:hover {
          background: var(--accent-primary, #d4a843);
          color: var(--bg-dark, #121214) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 168, 67, 0.35);
        }
        @keyframes suqFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes suqSlideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div className="suq-cart-backdrop" onClick={closeCart} aria-hidden="true" />

      {/* Slide-over panel */}
      <aside className="suq-cart-panel" aria-label="Shopping Cart">
        {/* Header */}
        <div className="suq-cart-header">
          <div>
            <h2>
              <span>🛍️</span> Open Suq Cart
            </h2>
            <div style={{ marginTop: '0.4rem' }} className="suq-currency-picker">
              <span style={{ color: 'var(--text-muted)' }}>Display:</span>
              {['GHS', 'USD', 'GBP'].map(c => (
                <button
                  key={c}
                  className={`suq-currency-btn ${currency === c ? 'active' : ''}`}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button className="suq-cart-close" onClick={closeCart} aria-label="Close Cart">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="suq-cart-body">
          {items.length === 0 ? (
            <div className="suq-cart-empty">
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '280px', lineHeight: 1.6 }}>
                Explore books, apparel, Islamic calligraphy prints, and merchandise in Open Suq.
              </p>
              <button
                onClick={closeCart}
                className="almaghrib-pill-btn"
                style={{ marginTop: '1.5rem', padding: '0.65rem 1.5rem', fontSize: '0.78rem' }}
              >
                Start Browsing
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.variantId} className="suq-cart-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="suq-cart-item-img" />
                <div className="suq-cart-item-details">
                  <div>
                    <div className="suq-cart-item-title">{item.title}</div>
                    {item.variantTitle && (
                      <div className="suq-cart-item-variant">{item.variantTitle}</div>
                    )}
                  </div>

                  <div className="suq-cart-item-bottom">
                    <div className="suq-cart-qty-ctrl">
                      <button
                        className="suq-cart-qty-btn"
                        onClick={() => updateQuantity(item.variantId, -1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="suq-cart-qty-val">{item.quantity}</span>
                      <button
                        className="suq-cart-qty-btn"
                        onClick={() => updateQuantity(item.variantId, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="suq-cart-item-price">
                        {formatCurrency(parseFloat(item.price) * item.quantity, currency)}
                      </div>
                      <button
                        className="suq-cart-remove-btn"
                        onClick={() => removeItem(item.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="suq-cart-footer">
            <div className="suq-cart-subtotal-row">
              <span className="suq-cart-subtotal-label">Subtotal</span>
              <span className="suq-cart-subtotal-val">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              🚚 Shipping, customs & taxes calculated during checkout based on delivery address.
            </div>
            <Link
              href="/suq/checkout"
              className="suq-cart-checkout-btn"
              onClick={closeCart}
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
