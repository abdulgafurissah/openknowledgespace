'use client';

import { useState, useEffect } from 'react';
import DriveUploader, { DriveUploadResult } from '@/components/DriveUploader';
import styles from '../../admin.module.css';

interface EventData {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  bannerUrl: string | null;
  googleFormUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  organizerName: string | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [bannerResult, setBannerResult] = useState<DriveUploadResult | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !eventDate) {
      setError('Title and Event Date are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          eventDate,
          googleFormUrl,
          bannerUrl: bannerResult?.viewUrl ?? null,
          bannerDriveId: bannerResult?.fileId ?? null,
          isPublished: true, // Auto publish for MVP
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create event');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setEventDate('');
      setGoogleFormUrl('');
      setBannerResult(null);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      setEvents(events.filter(e => e.id !== id));
    } catch {
      alert('Failed to delete event');
    }
  }

  async function handleTogglePublish(event: EventData) {
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !event.isPublished }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents(events.map(e => (e.id === event.id ? { ...e, isPublished: updated.isPublished } : e)));
      }
    } catch {
      alert('Failed to update event');
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Events Manager</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Schedule online or physical events and collect registrations via Google Forms.
          </p>
        </div>
        <button
          className={styles.primaryAction}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Event'}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            New Event
          </h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Weekly Tafseer Class"
                required
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  required
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%'
                  }}
                />
              </div>

              {/* Google Form URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Google Form Embed URL (src)
                </label>
                <input
                  type="url"
                  value={googleFormUrl}
                  onChange={e => setGoogleFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                  style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Event Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this event about?"
                rows={3}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', resize: 'vertical'
                }}
              />
            </div>

            {/* Banner Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Event Banner (optional)
              </label>
              <DriveUploader
                accept="image/*"
                label="Upload a promotional banner for the event"
                onUploadComplete={result => setBannerResult(result)}
                maxSizeMB={5}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '0.7rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title || !eventDate}
                className={styles.primaryAction}
              >
                {submitting ? 'Creating...' : '🚀 Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {events.length} {events.length === 1 ? 'event' : 'events'} total
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <p>No events scheduled. Click &quot;Add New Event&quot; to organize one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Event', 'Date', 'Registration', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '260px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {event.googleFormUrl ? 'Google Form' : 'None'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                          background: event.isPublished ? 'rgba(29,132,152,0.15)' : 'rgba(90,106,132,0.15)',
                          color: event.isPublished ? 'var(--accent-primary)' : 'var(--text-muted)',
                          border: `1px solid ${event.isPublished ? 'rgba(29,132,152,0.25)' : 'rgba(90,106,132,0.2)'}`,
                        }}
                      >
                        {event.isPublished ? '● Live' : '○ Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleTogglePublish(event)} title={event.isPublished ? 'Unpublish' : 'Publish'} style={{ padding: '0.35rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}>
                          {event.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => handleDelete(event.id)} title="Delete" style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem' }}>
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
    </>
  );
}
