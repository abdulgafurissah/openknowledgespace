'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#059669',
          padding: '1rem 2rem',
          borderRadius: '9999px',
          fontWeight: 700,
          display: 'inline-block',
          margin: '0 auto',
        }}
      >
        ✓ JazakAllahu Khayran! You are subscribed to Open Suq updates.
      </div>
    );
  }

  return (
    <form className="suq-newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email address"
        className="suq-newsletter-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="almaghrib-pill-btn" style={{ padding: '0.85rem 1.75rem' }}>
        Subscribe
      </button>
    </form>
  );
}
