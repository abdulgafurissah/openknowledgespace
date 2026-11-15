'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/suq/currency';

interface ShippingOption {
  method: string;
  carrier?: string;
  costInGhs: number;
  estimatedDays?: string;
}

const COUNTRIES = [
  { code: 'GH', name: 'Ghana' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
];

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, currency, clearCart } = useCart();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateOrRegion, setStateOrRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('GH');
  const [notes, setNotes] = useState('');

  // Shipping calculation state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('Standard');
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch shipping quotes when destination country changes or cart items change
  useEffect(() => {
    if (items.length === 0) return;

    async function fetchShippingQuotes() {
      setLoadingShipping(true);
      try {
        const res = await fetch('/api/suq/shipping-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: {
              countryCode,
              city: city || 'Accra',
              postalCode,
            },
            items: items.map(i => ({
              sku: i.sku,
              podSku: i.podSku,
              quantity: i.quantity,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.quotes && data.quotes.length > 0) {
            setShippingOptions(data.quotes);
            setSelectedShippingMethod(data.quotes[0].method);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch shipping quotes:', err);
      } finally {
        setLoadingShipping(false);
      }
    }

    fetchShippingQuotes();
  }, [countryCode, city, postalCode, items]);

  const selectedShipping =
    shippingOptions.find(o => o.method === selectedShippingMethod) ||
    shippingOptions[0] || { costInGhs: countryCode === 'GH' ? 45.0 : 180.0 };

  const finalShippingCost = selectedShipping.costInGhs;
  const finalTotalAmount = subtotal + finalShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/suq/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name,
            email,
            phone,
            notes,
          },
          shippingAddress: {
            name,
            phone,
            line1: addressLine1,
            line2: addressLine2,
            city,
            stateOrRegion,
            postalCode,
            countryCode,
          },
          items: items.map(i => ({
            variantId: i.variantId,
            quantity: i.quantity,
            artworkUrl: undefined,
          })),
          shippingCost: finalShippingCost,
          currency: 'GHS',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      // Redirect to Paystack Hosted Checkout
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('No authorization URL returned from Paystack.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong during checkout.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty-wrap">
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link href="/suq" className="almaghrib-pill-btn">
          Return to Open Suq
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .checkout-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem 6rem;
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          gap: 3.5rem;
          align-items: start;
        }
        .checkout-box {
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-2xl, 1.5rem);
          padding: 2.5rem;
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
        }
        .checkout-title {
          font-family: var(--font-heading, serif);
          font-size: 1.8rem;
          color: var(--text-primary, #121214);
          margin-bottom: 0.5rem;
        }
        .checkout-sub {
          font-size: 0.95rem;
          color: var(--text-secondary, #444);
          margin-bottom: 2rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group.full {
          grid-column: 1 / -1;
        }
        .form-label {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary, #444);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-input, .form-select, .form-textarea {
          padding: 0.8rem 1rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, rgba(0,0,0,0.15));
          background: var(--bg-secondary, #ece6dc);
          font-size: 0.95rem;
          color: var(--text-primary, #121214);
          transition: border-color 0.2s ease;
          width: 100%;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--accent-primary, #d4a843);
          outline: none;
          background: #ffffff;
        }
        .shipping-method-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .shipping-card-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border: 1.5px solid var(--border-color, rgba(0,0,0,0.15));
          border-radius: var(--radius-lg, 12px);
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .shipping-card-option.active {
          border-color: var(--accent-primary, #d4a843);
          background: rgba(212, 168, 67, 0.06);
        }
        .summary-card {
          background: var(--bg-secondary, #ece6dc);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-2xl, 1.5rem);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .summary-item-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
        }
        .summary-item-img {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-sm, 6px);
          object-fit: cover;
          background: #ffffff;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-secondary, #444);
        }
        .summary-line.total {
          font-size: 1.35rem;
          font-family: var(--font-heading, serif);
          font-weight: 800;
          color: var(--text-primary, #121214);
          padding-top: 1rem;
          border-top: 2px solid var(--border-gold, rgba(212, 168, 67, 0.35));
        }
        .paystack-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary, #444);
          padding: 0.75rem 1rem;
          background: #ffffff;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
        }
        .btn-paystack-submit {
          width: 100%;
          padding: 1.1rem;
          background: var(--bg-dark, #121214);
          color: var(--accent-primary, #d4a843) !important;
          border: none;
          border-radius: 9999px;
          font-family: var(--font-mono, sans-serif);
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .btn-paystack-submit:hover:not(:disabled) {
          background: var(--accent-primary, #d4a843);
          color: var(--bg-dark, #121214) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 168, 67, 0.35);
        }
        .btn-paystack-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .checkout-empty-wrap {
          text-align: center;
          padding: 8rem 1.5rem;
          max-width: 500px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .checkout-layout { grid-template-columns: 1fr; gap: 2rem; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="checkout-layout">
        {/* Left: Customer & Address Form */}
        <section className="checkout-box">
          <h1 className="checkout-title">Checkout &amp; Shipping</h1>
          <p className="checkout-sub">
            Orders are fulfilled by Prodigi international print labs and securely processed via Paystack.
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#ef4444',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="suq-checkout-form">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              1. Contact Information
            </h3>

            <div className="form-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cust-name">Full Name *</label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amina Diallo"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cust-email">Email Address *</label>
                <input
                  id="cust-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group full">
                <label className="form-label" htmlFor="cust-phone">Phone Number (Required for courier updates) *</label>
                <input
                  id="cust-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +233 24 123 4567"
                  className="form-input"
                />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              2. Shipping Destination
            </h3>

            <div className="form-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="form-group full">
                <label className="form-label" htmlFor="ship-country">Country / Region *</label>
                <select
                  id="ship-country"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="form-select"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full">
                <label className="form-label" htmlFor="ship-line1">Street Address *</label>
                <input
                  id="ship-line1"
                  type="text"
                  required
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="House number, street name"
                  className="form-input"
                />
              </div>

              <div className="form-group full">
                <label className="form-label" htmlFor="ship-line2">Apartment, Suite, Unit (Optional)</label>
                <input
                  id="ship-line2"
                  type="text"
                  value={addressLine2}
                  onChange={e => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ship-city">City / Town *</label>
                <input
                  id="ship-city"
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Accra or London"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ship-region">State / Region / Province</label>
                <input
                  id="ship-region"
                  type="text"
                  value={stateOrRegion}
                  onChange={e => setStateOrRegion(e.target.value)}
                  placeholder="Greater Accra"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ship-postal">Postal / Zip Code</label>
                <input
                  id="ship-postal"
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="e.g. 00233"
                  className="form-input"
                />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              3. Fulfilment &amp; Delivery Method
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Prodigi print facilities allocate production to the nearest hub to guarantee the fastest delivery.
            </p>

            <div className="shipping-method-row">
              {loadingShipping ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Calculating international shipping quotes...
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="shipping-card-option active">
                  <div>
                    <div style={{ fontWeight: 700 }}>Standard International Courier</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tracked dispatch via DHL/FedEx</div>
                  </div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(finalShippingCost, currency)}
                  </div>
                </div>
              ) : (
                shippingOptions.map(opt => (
                  <div
                    key={opt.method}
                    className={`shipping-card-option ${selectedShippingMethod === opt.method ? 'active' : ''}`}
                    onClick={() => setSelectedShippingMethod(opt.method)}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {opt.method} Delivery {opt.carrier && `(${opt.carrier})`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {opt.estimatedDays || 'Tracked international dispatch'}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(opt.costInGhs, currency)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </form>
        </section>

        {/* Right: Order Summary */}
        <aside className="summary-card">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map(item => (
              <div key={item.variantId} className="summary-item-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="summary-item-img" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {item.variantTitle && `${item.variantTitle} · `}Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem' }}>
                  {formatCurrency(parseFloat(item.price) * item.quantity, currency)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            <div className="summary-line">
              <span>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="summary-line">
              <span>Shipping &amp; Handling</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {formatCurrency(finalShippingCost, currency)}
              </span>
            </div>
            <div className="summary-line total">
              <span>Total to Pay</span>
              <span style={{ color: 'var(--accent-primary, #d4a843)' }}>
                {formatCurrency(finalTotalAmount, currency)}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              Final settlement currency: <strong>GHS {finalTotalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="paystack-badge">
            <span>🛡️</span>
            <div>
              <strong>Secure Paystack Gateway:</strong> Accepts Visa, Mastercard, and Ghana Mobile Money (MTN MoMo, Telecel, AT).
            </div>
          </div>

          <button
            type="submit"
            form="suq-checkout-form"
            disabled={submitting || items.length === 0}
            className="btn-paystack-submit"
          >
            {submitting ? 'Connecting to Paystack...' : `Pay GH₵ ${finalTotalAmount.toFixed(2)} →`}
          </button>
        </aside>
      </div>
    </>
  );
}
