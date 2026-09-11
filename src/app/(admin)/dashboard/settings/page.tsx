"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok && active) {
          const data = await res.json();
          setEmail(data.email || "");
          setFullName(data.fullName || "");
          setRole(data.role || "STUDENT");
          setLoading(false);
        }
      } catch {
        // silently fail
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }

    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading profile...</div>;
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Manage your profile information and preferences.
          </p>
        </div>
      </div>

      <div style={{ 
        background: 'var(--bg-secondary)', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-color)',
        maxWidth: '600px'
      }}>
        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.5rem',
            background: message.type === 'success' ? 'rgba(30, 158, 110, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--accent-primary)' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'var(--accent-primary)' : '#ef4444'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              disabled 
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-secondary)',
                cursor: 'not-allowed'
              }} 
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your email address cannot be changed.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="fullName" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abdullah Ibn Masud"
              required
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-primary)', 
                color: 'var(--text-primary)'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Account Role</label>
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              display: 'inline-block',
              width: 'fit-content'
            }}>
              {role}
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              type="submit" 
              className={styles.primaryAction}
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
