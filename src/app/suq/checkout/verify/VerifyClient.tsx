'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/suq/currency';

interface VerifyClientProps {
  success: boolean;
  orderNumber: string;
  amountGHS: number;
  customerName?: string;
  customerEmail?: string;
  fulfilmentStatus?: string;
  errorMessage?: string;
}

export default function VerifyClient({
  success,
  orderNumber,
  amountGHS,
  customerName,
  customerEmail,
  fulfilmentStatus,
  errorMessage,
}: VerifyClientProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [success, clearCart]);

  return (
    <>
      <style>{`
        .verify-wrap {
          max-width: 680px;
          margin: 4rem auto 6rem;
          padding: 0 1.5rem;
        }
        .verify-card {
          background: #ffffff;
          border-radius: var(--radius-2xl, 1.5rem);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          padding: 3rem 2.5rem;
          text-align: center;
          box-shadow: var(--shadow-lg, 0 16px 40px -8px rgba(0,0,0,0.12));
        }
        .verify-icon-wrap {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2.2rem;
        }
        .verify-icon-success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 2px solid #10b981;
        }
        .verify-icon-fail {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 2px solid #ef4444;
        }
        .verify-title {
          font-family: var(--font-heading, serif);
          font-size: 2rem;
          color: var(--text-primary, #121214);
          margin-bottom: 0.5rem;
        }
        .verify-sub {
          font-size: 1rem;
          color: var(--text-secondary, #444);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .receipt-box {
          background: var(--bg-secondary, #ece6dc);
          border-radius: var(--radius-xl, 1rem);
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .receipt-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary, #444);
        }
        .receipt-line strong {
          color: var(--text-primary, #121214);
        }
        .fulfilment-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
        }
      `}</style>

      <div className="verify-wrap">
        <div className="verify-card">
          {success ? (
            <>
              <div className="verify-icon-wrap verify-icon-success">✓</div>
              <h1 className="verify-title">Payment Confirmed!</h1>
              <p className="verify-sub">
                Alhamdulillah! Your order has been placed successfully and submitted to our print-on-demand production pipeline.
              </p>

              <div className="receipt-box">
                <div className="receipt-line">
                  <span>Order Reference</span>
                  <strong>{orderNumber}</strong>
                </div>
                {customerName && (
                  <div className="receipt-line">
                    <span>Customer</span>
                    <strong>{customerName}</strong>
                  </div>
                )}
                {customerEmail && (
                  <div className="receipt-line">
                    <span>Confirmation Sent To</span>
                    <strong>{customerEmail}</strong>
                  </div>
                )}
                <div className="receipt-line">
                  <span>Total Amount Paid</span>
                  <strong style={{ color: 'var(--accent-primary, #d4a843)' }}>
                    {formatCurrency(amountGHS, 'GHS', true)}
                  </strong>
                </div>
                <div className="receipt-line">
                  <span>Production Status</span>
                  <span className="fulfilment-badge">
                    ● {fulfilmentStatus || 'Submitted to Prodigi'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/suq" className="almaghrib-pill-btn">
                  Continue Shopping
                </Link>
                <Link
                  href="/dashboard"
                  className="filter-btn"
                  style={{ padding: '0.85rem 1.8rem', background: 'var(--bg-secondary)' }}
                >
                  View My Orders
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="verify-icon-wrap verify-icon-fail">✕</div>
              <h1 className="verify-title">Payment Not Completed</h1>
              <p className="verify-sub">
                {errorMessage || 'The payment could not be verified by Paystack. Your card was not charged.'}
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/suq/checkout" className="almaghrib-pill-btn">
                  Try Again
                </Link>
                <Link href="/suq" className="filter-btn" style={{ padding: '0.85rem 1.8rem' }}>
                  Return to Store
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
