'use client';

import React, { useState, useEffect } from 'react';
import BlobUploader, { FileUploadResult } from '@/components/BlobUploader';
import { formatCurrency } from '@/lib/suq/currency';
import { calculatePricingBreakdown } from '@/lib/suq/pricing';
import { getOrderDestination } from '@/lib/suq/destination';

export default function AdminSuqClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'integrations'>('overview');

  // Stats & Metrics
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [submittingProdigiId, setSubmittingProdigiId] = useState<string | null>(null);

  // Local Fulfilment Modal State
  const [localFulfilModalOrder, setLocalFulfilModalOrder] = useState<any | null>(null);
  const [localCarrier, setLocalCarrier] = useState('Ghana Post');
  const [localTrackingNumber, setLocalTrackingNumber] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [submittingLocalFulfil, setSubmittingLocalFulfil] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // New Product Form State
  const [pTitle, setPTitle] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pCategory, setPCategory] = useState('books-publications');
  const [pDesc, setPDesc] = useState('');
  const [pIsBook, setPIsBook] = useState(false);
  const [pAuthor, setPAuthor] = useState('');
  const [pIsbn, setPIsbn] = useState('');
  const [pPages, setPPages] = useState('');
  const [pBinding, setPBinding] = useState('');
  const [pLanguage, setPLanguage] = useState('');
  const [pImageResult, setPImageResult] = useState<FileUploadResult | null>(null);
  const [pArtResult, setPArtResult] = useState<FileUploadResult | null>(null);

  // Variant in form
  const [vTitle, setVTitle] = useState('Standard Edition');
  const [vPodSku, setVPodSku] = useState('GLOBAL-BOK-HC-8.5X11');
  const [vCostPrice, setVCostPrice] = useState('120');
  const [vRetailPrice, setVRetailPrice] = useState('220');
  const [vCompareAt, setVCompareAt] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') fetchProducts();
  }, [activeTab]);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/suq/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/suq/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/suq/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleRetryFulfilment(orderId: string) {
    setRetryingOrderId(orderId);
    try {
      const res = await fetch(`/api/suq/admin/orders/${orderId}/retry`, {
        method: 'POST',
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Fulfilment retry triggered successfully!' });
        fetchOrders();
      } else {
        setActionMessage({ type: 'error', text: 'Retry failed. Please check error logs.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error while retrying.' });
    } finally {
      setRetryingOrderId(null);
    }
  }

  async function handleDispatchToProdigi(orderId: string, orderNumber: string) {
    if (!confirm(`Are you sure you want to dispatch order ${orderNumber} to Prodigi for international printing & fulfilment?`)) return;
    setSubmittingProdigiId(orderId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/suq/admin/orders/${orderId}/submit-prodigi`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Order ${orderNumber} successfully submitted to Prodigi! (External ID: ${data.externalOrderId || 'active'})`,
        });
        fetchOrders();
      } else {
        setActionMessage({
          type: 'error',
          text: `Prodigi dispatch failed: ${data.message || 'Unknown error'}`,
        });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error while contacting Prodigi.' });
    } finally {
      setSubmittingProdigiId(null);
    }
  }

  async function handleConfirmLocalFulfil() {
    if (!localFulfilModalOrder) return;
    setSubmittingLocalFulfil(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/suq/admin/orders/${localFulfilModalOrder.id}/fulfil-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: localCarrier,
          trackingNumber: localTrackingNumber,
          notes: localNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Order ${localFulfilModalOrder.orderNumber} marked as fulfilled locally!`,
        });
        setLocalFulfilModalOrder(null);
        setLocalTrackingNumber('');
        setLocalNotes('');
        fetchOrders();
      } else {
        setActionMessage({
          type: 'error',
          text: `Local fulfilment update failed: ${data.message || 'Unknown error'}`,
        });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error during local fulfilment update.' });
    } finally {
      setSubmittingLocalFulfil(false);
    }
  }

  async function handleMarkDelivered(orderId: string, orderNumber: string) {
    if (!confirm(`Mark order ${orderNumber} as delivered?`)) return;
    setActionMessage(null);
    try {
      const res = await fetch(`/api/suq/admin/orders/${orderId}/mark-delivered`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: `Order ${orderNumber} marked as delivered!`,
        });
        fetchOrders();
      } else {
        setActionMessage({
          type: 'error',
          text: `Failed to mark delivered: ${data.message || 'Unknown error'}`,
        });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error.' });
    }
  }

  async function handleTogglePublish(product: any) {
    try {
      const res = await fetch(`/api/suq/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });
      if (res.ok) {
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, isPublished: !product.isPublished } : p))
        );
      }
    } catch {
      alert('Failed to update product');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/suq/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      alert('Failed to delete product');
    }
  }

  const handleTitleChange = (val: string) => {
    setPTitle(val);
    setPSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pSlug) return;
    if (!pImageResult) {
      setProductError('Please upload a product mockup/cover image.');
      return;
    }

    setSubmittingProduct(true);
    setProductError(null);

    try {
      const res = await fetch('/api/suq/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pTitle,
          slug: pSlug,
          description: pDesc,
          productType: 'physical_pod',
          bookDetails: pIsBook
            ? {
                author: pAuthor,
                isbn: pIsbn,
                pages: parseInt(pPages, 10) || 100,
                binding: pBinding,
                language: pLanguage,
              }
            : null,
          images: [pImageResult.viewUrl],
          artworkUrl: pArtResult?.downloadUrl || undefined,
          variants: [
            {
              title: vTitle,
              podSku: vPodSku,
              costPrice: vCostPrice,
              retailPrice: vRetailPrice,
              compareAtPrice: vCompareAt || null,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }

      // Reset
      setPTitle('');
      setPSlug('');
      setPDesc('');
      setPImageResult(null);
      setPArtResult(null);
      setShowProductForm(false);
      fetchProducts();
    } catch (err: any) {
      setProductError(err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Live pricing breakdown for variant in form
  const variantBreakdown = calculatePricingBreakdown(
    parseFloat(vRetailPrice || '0'),
    parseFloat(vCostPrice || '0')
  );

  const filteredOrders = orders.filter(ord => {
    const dest = getOrderDestination(ord.shippingAddress?.countryCode);

    if (orderFilter === 'LOCAL_PRINT') {
      if (dest.type !== 'local' && dest.type !== 'african') return false;
    } else if (orderFilter === 'INTERNATIONAL') {
      if (dest.type !== 'international') return false;
    } else if (orderFilter === 'NEEDS_FULFILMENT') {
      if (ord.paymentStatus !== 'paid' || (ord.fulfilmentStatus !== 'pending' && ord.fulfilmentStatus !== 'failed')) return false;
    } else if (orderFilter === 'PAID') {
      if (ord.paymentStatus !== 'paid') return false;
    } else if (orderFilter === 'SHIPPED') {
      if (ord.fulfilmentStatus !== 'shipped' && ord.fulfilmentStatus !== 'delivered') return false;
    } else if (orderFilter === 'FAILED') {
      if (ord.fulfilmentStatus !== 'failed') return false;
    }

    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const matchNum = ord.orderNumber?.toLowerCase().includes(q);
      const matchEmail = ord.guestEmail?.toLowerCase().includes(q);
      const matchName = ord.guestName?.toLowerCase().includes(q);
      const matchCountry = ord.shippingAddress?.countryCode?.toLowerCase().includes(q);
      const matchCity = ord.shippingAddress?.city?.toLowerCase().includes(q);
      return matchNum || matchEmail || matchName || matchCountry || matchCity;
    }
    return true;
  });

  return (
    <>
      <style>{`
        .admin-suq-page {
          padding: 2rem 2.5rem 6rem;
          max-width: 1300px;
          margin: 0 auto;
        }
        .admin-nav-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid var(--border-color, rgba(0,0,0,0.08));
          margin-bottom: 2.5rem;
        }
        .admin-tab-btn {
          padding: 0.85rem 1.5rem;
          border: none;
          background: transparent;
          font-family: var(--font-mono, sans-serif);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary, #444);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .admin-tab-btn:hover {
          color: var(--text-primary, #121214);
        }
        .admin-tab-btn.active {
          color: var(--accent-primary, #d4a843);
        }
        .admin-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-primary, #d4a843);
          border-radius: 9999px;
        }
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .kpi-card {
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-xl, 1rem);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm, 0 2px 6px rgba(0,0,0,0.04));
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .kpi-label {
          font-family: var(--font-mono, sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted, #74747c);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .kpi-val {
          font-family: var(--font-mono, sans-serif);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary, #121214);
        }
        .kpi-sub {
          font-size: 0.78rem;
          color: var(--text-secondary, #444);
        }
        .admin-data-card {
          background: #ffffff;
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: var(--radius-xl, 1rem);
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .admin-table th {
          text-align: left;
          padding: 0.85rem 1.25rem;
          background: var(--bg-secondary, #ece6dc);
          font-family: var(--font-mono, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary, #444);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
        }
        .admin-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          color: var(--text-primary, #121214);
        }
        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 800;
          font-family: var(--font-mono, sans-serif);
          text-transform: uppercase;
        }
        .status-paid { background: rgba(16,185,129,0.15); color: #059669; }
        .status-pending { background: rgba(245,158,11,0.15); color: #d97706; }
        .status-failed { background: rgba(239,68,68,0.15); color: #dc2626; }
        .status-shipped { background: rgba(59,130,246,0.15); color: #2563eb; }
        .status-submitted { background: rgba(147,51,234,0.15); color: #7c3aed; }
        .status-delivered { background: rgba(16,185,129,0.2); color: #047857; }
        .btn-action-prodigi {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 0.76rem;
          font-weight: 700;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }
        .btn-action-prodigi:hover { background: #1d4ed8; }
        .btn-action-local {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          background: #059669;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 0.76rem;
          font-weight: 700;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }
        .btn-action-local:hover { background: #047857; }
        .btn-action-delivered {
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          cursor: pointer;
          font-size: 0.74rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .dest-badge {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="admin-suq-page">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span className="almaghrib-tag" style={{ marginBottom: '0.4rem' }}>E-Commerce &amp; POD Suite</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--text-primary)' }}>
              Open Suq Control Center
            </h1>
          </div>
          <a
            href="/suq"
            target="_blank"
            rel="noopener noreferrer"
            className="filter-btn"
            style={{ padding: '0.75rem 1.5rem', background: '#ffffff' }}
          >
            Preview Storefront ↗
          </a>
        </div>

        {/* Tab Navigation */}
        <nav className="admin-nav-tabs" aria-label="Admin Navigation Tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Financial Overview
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders &amp; Fulfilment
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛍️ Products &amp; Designs
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            ⚙️ Integrations &amp; Health
          </button>
        </nav>

        {/* ─── TAB 1: FINANCIAL OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div>
            {loadingStats ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading financial metrics...
              </div>
            ) : stats?.metrics ? (
              <>
                <div className="admin-kpi-grid">
                  <div className="kpi-card">
                    <span className="kpi-label">Total Gross Sales</span>
                    <span className="kpi-val" style={{ color: 'var(--accent-primary, #d4a843)' }}>
                      {formatCurrency(stats.metrics.totalGrossSales, 'GHS')}
                    </span>
                    <span className="kpi-sub">{stats.metrics.paidOrdersCount} Paid Orders</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Production Expenses</span>
                    <span className="kpi-val">
                      {formatCurrency(stats.metrics.totalProductionCost, 'GHS')}
                    </span>
                    <span className="kpi-sub">Prodigi Manufacturing Costs</span>
                  </div>

                  <div className="kpi-card">
                    <span className="kpi-label">Payment &amp; Gateway Fees</span>
                    <span className="kpi-val">
                      {formatCurrency(stats.metrics.estimatedPaystackFees, 'GHS')}
                    </span>
                    <span className="kpi-sub">Paystack Processing (Ghana)</span>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <span className="kpi-label">Estimated Net Profit</span>
                    <span className="kpi-val" style={{ color: '#10b981' }}>
                      {formatCurrency(stats.metrics.estimatedNetProfit, 'GHS')}
                    </span>
                    <span className="kpi-sub">Revenue minus all expenses</span>
                  </div>
                </div>

                {/* Additional Stats Row */}
                <div className="admin-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="kpi-card">
                    <span className="kpi-label">Pending Fulfilment</span>
                    <span className="kpi-val">{stats.metrics.pendingFulfilmentCount}</span>
                    <span className="kpi-sub">Awaiting dispatch/production</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Published Products</span>
                    <span className="kpi-val">{stats.metrics.totalProducts}</span>
                    <span className="kpi-sub">Across 6 main categories</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Fulfilment Architecture</span>
                    <span className="kpi-val" style={{ fontSize: '1.15rem' }}>Hybrid Manual Routing</span>
                    <span className="kpi-sub">Self-Print (Africa) • Prodigi (International)</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ─── TAB 2: ORDERS & FULFILMENT ─── */}
        {activeTab === 'orders' && (
          <div>
            {/* Action Feedback Banner */}
            {actionMessage && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: actionMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${actionMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  color: actionMessage.type === 'success' ? '#065f46' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span>{actionMessage.type === 'success' ? '✓ ' : '✕ '}{actionMessage.text}</span>
                <button
                  onClick={() => setActionMessage(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'inherit' }}
                >
                  &times;
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by order #, email, customer, or country..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  fontSize: '0.88rem',
                  minWidth: '280px',
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All Orders' },
                  { id: 'LOCAL_PRINT', label: '🇬🇭 Local & Africa (Self-Print)' },
                  { id: 'INTERNATIONAL', label: '✈️ International (Prodigi)' },
                  { id: 'NEEDS_FULFILMENT', label: '⏳ Needs Fulfilment' },
                  { id: 'PAID', label: 'Paid' },
                  { id: 'SHIPPED', label: 'Shipped' },
                  { id: 'FAILED', label: 'Failed' },
                ].map(f => (
                  <button
                    key={f.id}
                    className={`filter-btn ${orderFilter === f.id ? 'active' : ''}`}
                    onClick={() => setOrderFilter(f.id)}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-data-card">
              {loadingOrders ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders found matching the selected filter.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Customer &amp; Destination</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Fulfilment Route</th>
                        <th>Status &amp; Tracking</th>
                        <th style={{ minWidth: '180px' }}>Manual Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(ord => {
                        const dest = getOrderDestination(ord.shippingAddress?.countryCode);
                        const isPaid = ord.paymentStatus === 'paid';
                        const isPendingFulfilment = ord.fulfilmentStatus === 'pending' || ord.fulfilmentStatus === 'failed';
                        const isShipped = ord.fulfilmentStatus === 'shipped';
                        const isDelivered = ord.fulfilmentStatus === 'delivered';
                        const isSubmitted = ord.fulfilmentStatus === 'submitted' || ord.fulfilmentStatus === 'in_production';

                        return (
                          <tr key={ord.id}>
                            <td><strong>{ord.orderNumber}</strong></td>
                            <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{ord.guestName || 'Customer'}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                {ord.guestEmail}
                              </div>
                              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                <span
                                  className="dest-badge"
                                  style={{
                                    background: dest.badgeStyle.background,
                                    color: dest.badgeStyle.color,
                                    border: dest.badgeStyle.border,
                                  }}
                                >
                                  {dest.label}
                                </span>
                                {ord.shippingAddress?.city && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {ord.shippingAddress.city}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {formatCurrency(ord.totalAmount, 'GHS')}
                            </td>
                            <td>
                              <span className={`status-badge status-${ord.paymentStatus}`}>
                                {ord.paymentStatus}
                              </span>
                            </td>
                            <td>
                              {ord.fulfilment?.provider === 'LOCAL_PRINT' ? (
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                                  🏷️ Local Self-Print
                                </span>
                              ) : ord.fulfilment?.provider === 'PRODIGI' ? (
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>
                                  🌐 Prodigi POD
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {dest.type === 'international' ? '✈️ Prodigi Candidate' : '🇬🇭 Self-Print Candidate'}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge status-${ord.fulfilmentStatus}`}>
                                {ord.fulfilmentStatus}
                              </span>
                              {ord.fulfilment?.externalOrderId && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  ID: {ord.fulfilment.externalOrderId}
                                </div>
                              )}
                              {ord.fulfilment?.trackingNumber && (
                                <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.2rem' }}>
                                  {ord.fulfilment.carrier ? `${ord.fulfilment.carrier}: ` : ''}
                                  {ord.fulfilment.trackingUrl ? (
                                    <a
                                      href={ord.fulfilment.trackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ textDecoration: 'underline' }}
                                    >
                                      {ord.fulfilment.trackingNumber}
                                    </a>
                                  ) : (
                                    ord.fulfilment.trackingNumber
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              {!isPaid ? (
                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                  Awaiting payment
                                </span>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  {/* Pending Fulfilment Actions */}
                                  {isPendingFulfilment && (
                                    <>
                                      {/* Local Fulfilment Button (Primary for local/africa, secondary for intl) */}
                                      <button
                                        onClick={() => {
                                          setLocalFulfilModalOrder(ord);
                                          setLocalCarrier(dest.type === 'local' ? 'Ghana Post / VIP Dispatch' : 'African Courier Service');
                                        }}
                                        className="btn-action-local"
                                        title="Print and package this order yourself"
                                      >
                                        🏷️ Fulfil Locally
                                      </button>

                                      {/* Prodigi Dispatch Button (Primary for intl, secondary for local) */}
                                      <button
                                        onClick={() => handleDispatchToProdigi(ord.id, ord.orderNumber)}
                                        disabled={submittingProdigiId === ord.id}
                                        className="btn-action-prodigi"
                                        title="Submit order to Prodigi Print API"
                                      >
                                        {submittingProdigiId === ord.id ? 'Submitting...' : '✈️ Send to Prodigi'}
                                      </button>
                                    </>
                                  )}

                                  {/* Submitted to Prodigi: In Production */}
                                  {isSubmitted && (
                                    <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>
                                      ● In Production (Prodigi)
                                    </span>
                                  )}

                                  {/* Shipped: Can Mark Delivered */}
                                  {isShipped && (
                                    <button
                                      onClick={() => handleMarkDelivered(ord.id, ord.orderNumber)}
                                      className="btn-action-delivered"
                                      title="Mark order as successfully delivered"
                                    >
                                      ✓ Mark Delivered
                                    </button>
                                  )}

                                  {/* Delivered */}
                                  {isDelivered && (
                                    <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Local Fulfilment Modal */}
            {localFulfilModalOrder && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1.5rem',
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '520px',
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>
                      Local / Self-Print Fulfilment
                    </h3>
                    <button
                      onClick={() => setLocalFulfilModalOrder(null)}
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      &times;
                    </button>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    You are marking Order <strong>{localFulfilModalOrder.orderNumber}</strong> as printed and dispatched locally by yourself.
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Delivery Carrier / Dispatch Method
                    </label>
                    <input
                      type="text"
                      value={localCarrier}
                      onChange={e => setLocalCarrier(e.target.value)}
                      placeholder="e.g. Ghana Post, VIP Courier, Dispatch Rider, In-Person Pickup"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Tracking Number or Waybill (Optional)
                    </label>
                    <input
                      type="text"
                      value={localTrackingNumber}
                      onChange={e => setLocalTrackingNumber(e.target.value)}
                      placeholder="e.g. GP-994821 or Waybill #402"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Internal Dispatch Notes (Optional)
                    </label>
                    <textarea
                      value={localNotes}
                      onChange={e => setLocalNotes(e.target.value)}
                      placeholder="Printed locally, handed to dispatch rider on 15 Nov."
                      rows={2}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setLocalFulfilModalOrder(null)}
                      className="filter-btn"
                      style={{ padding: '0.6rem 1.25rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmLocalFulfil}
                      disabled={submittingLocalFulfil}
                      className="btn-action-local"
                      style={{ padding: '0.6rem 1.5rem', fontSize: '0.82rem' }}
                    >
                      {submittingLocalFulfil ? 'Updating...' : '✓ Confirm Fulfilment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: PRODUCTS & DESIGNS ─── */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {products.length} products in Open Suq catalogue
              </div>
              <button
                className="almaghrib-pill-btn"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.78rem' }}
                onClick={() => setShowProductForm(!showProductForm)}
              >
                {showProductForm ? '✕ Cancel' : '+ Add POD Product'}
              </button>
            </div>

            {/* Add Product Form */}
            {showProductForm && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '2.5rem',
                  marginBottom: '2.5rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
                  Create New Print-on-Demand Product
                </h2>

                {productError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    ⚠️ {productError}
                  </div>
                )}

                <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Title *</label>
                      <input
                        type="text"
                        required
                        value={pTitle}
                        onChange={e => handleTitleChange(e.target.value)}
                        placeholder="e.g. Arabic Calligraphy Canvas Print"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Slug *</label>
                      <input
                        type="text"
                        required
                        value={pSlug}
                        onChange={e => setPSlug(e.target.value)}
                        placeholder="arabic-calligraphy-canvas-print"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description</label>
                    <textarea
                      rows={3}
                      value={pDesc}
                      onChange={e => setPDesc(e.target.value)}
                      placeholder="Crafted with museum archival inks..."
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>

                  {/* Book Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={pIsBook}
                      onChange={e => setPIsBook(e.target.checked)}
                    />
                    Is this an Islamic or Educational Book? (Enables ISBN, Page count, Binding specs)
                  </label>

                  {pIsBook && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f9f8f6', padding: '1.5rem', borderRadius: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Author</label>
                        <input type="text" value={pAuthor} onChange={e => setPAuthor(e.target.value)} placeholder="Author name" style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>ISBN</label>
                        <input type="text" value={pIsbn} onChange={e => setPIsbn(e.target.value)} placeholder="978-..." style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Pages</label>
                        <input type="number" value={pPages} onChange={e => setPPages(e.target.value)} placeholder="120" style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Binding</label>
                        <input type="text" value={pBinding} onChange={e => setPBinding(e.target.value)} placeholder="Hardcover / Paperback" style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                    </div>
                  )}

                  {/* Upload Mockup & Print File */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                        Product Mockup / Cover Image *
                      </label>
                      <BlobUploader
                        accept="image/*"
                        label="Upload product cover image"
                        onUploadComplete={res => setPImageResult(res)}
                        maxSizeMB={10}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                        High-Resolution Print-Ready Artwork (PDF / PNG)
                      </label>
                      <BlobUploader
                        accept=".pdf,.png,.jpg,.jpeg"
                        label="Upload master print file (sent to Prodigi)"
                        onUploadComplete={res => setPArtResult(res)}
                        maxSizeMB={50}
                      />
                    </div>
                  </div>

                  {/* Initial Variant & Pricing Engine Preview */}
                  <div style={{ background: '#f9f8f6', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
                      Initial Variant &amp; Margin Calculation Engine
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Edition / Variant Title</label>
                        <input type="text" value={vTitle} onChange={e => setVTitle(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Prodigi SKU</label>
                        <input type="text" value={vPodSku} onChange={e => setVPodSku(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Production Cost (GHS)</label>
                        <input type="number" value={vCostPrice} onChange={e => setVCostPrice(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Retail Price (GHS) *</label>
                        <input type="number" value={vRetailPrice} onChange={e => setVRetailPrice(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                    </div>

                    {/* Live Margin Calculation Preview */}
                    <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Est. Paystack Fee: </span>
                        <strong>GH₵ {variantBreakdown.paystackFee.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Est. Net Profit: </span>
                        <strong style={{ color: '#10b981' }}>GH₵ {variantBreakdown.estimatedNetProfit.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Margin: </span>
                        <strong>{variantBreakdown.profitMarginPercent}%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" onClick={() => setShowProductForm(false)} className="filter-btn">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProduct || !pTitle || !pImageResult}
                      className="almaghrib-pill-btn"
                    >
                      {submittingProduct ? 'Publishing...' : 'Publish Product to Open Suq'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="admin-data-card">
              {loadingProducts ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>Loading products...</div>
              ) : products.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No products in catalogue yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Variants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {p.images?.[0]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.images[0].url}
                                  alt={p.title}
                                  style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 700 }}>{p.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/suq/p/{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.categoryName || 'General'}</td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {p.variants?.length || 0} variants
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: p.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                                color: p.isPublished ? '#059669' : '#4b5563',
                              }}
                            >
                              {p.isPublished ? '● Live' : '○ Draft'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleTogglePublish(p)}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc',
                                  background: '#fff',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {p.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'rgba(239,68,68,0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: INTEGRATIONS & HEALTH ─── */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Prodigi Card */}
            <div className="admin-data-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Prodigi Print API (v4.0)
                </h3>
                <span
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: stats?.integrations?.prodigi?.configured ? '#10b98122' : '#f59e0b22',
                    color: stats?.integrations?.prodigi?.configured ? '#059669' : '#d97706',
                  }}
                >
                  {stats?.integrations?.prodigi?.configured ? 'Active' : 'Sandbox Ready'}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div><strong>Environment:</strong> {stats?.integrations?.prodigi?.environment || 'sandbox'}</div>
                <div><strong>Fulfilment Mode:</strong> Manual On-Demand (International) &amp; Self-Print (Local/Africa)</div>
                <div><strong>Webhook Callback Route:</strong> <code>/api/webhooks/prodigi</code></div>
              </div>
            </div>

            {/* Paystack Card */}
            <div className="admin-data-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Paystack Gateway (Ghana)
                </h3>
                <span
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: stats?.integrations?.paystack?.configured ? '#10b98122' : '#f59e0b22',
                    color: stats?.integrations?.paystack?.configured ? '#059669' : '#d97706',
                  }}
                >
                  {stats?.integrations?.paystack?.configured ? 'Active' : 'Test Mode Ready'}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div><strong>Merchant Currency:</strong> GHS (Ghanaian Cedi)</div>
                <div><strong>Channels:</strong> Mobile Money (MTN MoMo, Telecel, AT) &amp; Cards</div>
                <div><strong>Webhook Route:</strong> <code>/api/webhooks/paystack</code></div>
                <div><strong>Signature Verification:</strong> HMAC SHA-512 Enforced</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
