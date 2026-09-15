import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface EventItem {
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

async function getEvent(id: string): Promise<EventItem | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return {
    title: event ? `${event.title} — Events` : 'Event Not Found',
    description: event?.description ?? undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  
  if (!event || !event.isPublished) notFound();

  const formattedDate = event.eventDate 
    ? new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'TBD';

  return (
    <>
      <Navbar />
      <style>{`
        .event-detail-layout {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .event-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color var(--transition-fast);
        }
        .event-detail-back:hover { color: var(--accent-primary); }
        
        .event-detail-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .event-detail-banner {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }
        .event-detail-banner-placeholder {
          width: 100%;
          height: 280px;
          background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
        }
        .event-detail-body {
          padding: 2.5rem;
        }
        .event-detail-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-family: var(--font-heading);
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .event-detail-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          padding: 1.25rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .meta-icon {
          color: var(--accent-primary);
          display: flex;
        }
        .event-detail-description {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.05rem;
          white-space: pre-wrap;
        }
        
        .event-form-section {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          padding-top: 1rem;
        }
        .event-form-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 1rem 0 2rem;
        }
        .google-form-iframe {
          width: 100%;
          height: 800px;
          border: none;
        }
        @media (max-width: 640px) {
          .event-detail-layout { padding: 2rem 1rem; }
          .event-detail-body { padding: 1.5rem; }
          .google-form-iframe { height: 1000px; }
        }
      `}</style>

      <div className="event-detail-layout">
        <Link href="/events" className="event-detail-back">
          ← Back to Events
        </Link>

        <article className="event-detail-card">
          {event.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="event-detail-banner"
            />
          ) : (
            <div className="event-detail-banner-placeholder">
              🎪
            </div>
          )}

          <div className="event-detail-body">
            <h1 className="event-detail-title">{event.title}</h1>
            
            <div className="event-detail-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                {formattedDate}
              </div>
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                {event.organizerName ?? 'Admin'}
              </div>
            </div>

            {event.description && (
              <div className="event-detail-description">{event.description}</div>
            )}
          </div>
        </article>

        {event.googleFormUrl ? (
          <section className="event-form-section" id="register">
            <h2 className="event-form-title">Register for this Event</h2>
            <iframe 
              src={event.googleFormUrl}
              className="google-form-iframe"
              title="Registration Form"
            >
              Loading form...
            </iframe>
          </section>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Registration not open yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back later for the registration form.</p>
          </div>
        )}
      </div>
    </>
  );
}
