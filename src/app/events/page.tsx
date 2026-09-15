import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Events — Open Knowledge Space',
  description: 'Upcoming classes, webinars, and events from the Open Knowledge Space.',
};

export const revalidate = 60;

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

async function getEvents(): Promise<EventItem[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/events`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />
      <style>{`
        .events-hero {
          padding: 5rem 2rem 3rem;
          text-align: center;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, transparent 100%);
          border-bottom: 1px solid var(--border-color);
        }
        .events-hero h1 {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .events-hero p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .event-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all var(--transition-normal);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .event-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-emerald);
        }
        .event-banner {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        .event-banner-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .event-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .event-date {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          background: rgba(29,132,152,0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(29,132,152,0.2);
          width: fit-content;
        }
        .event-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .event-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .event-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .btn-register {
          background: var(--accent-primary);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          transition: background var(--transition-fast);
        }
        .event-card:hover .btn-register {
          background: var(--accent-hover);
        }
        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
        }
      `}</style>

      <section className="events-hero">
        <h1>Upcoming Events</h1>
        <p>Register for live classes, workshops, and community events.</p>
      </section>

      <main className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h2>No upcoming events</h2>
            <p>Check back soon for new announcements!</p>
          </div>
        ) : (
          events.map(event => (
            <Link key={event.id} href={`/events/${event.id}`} className="event-card">
              {event.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.bannerUrl} alt={event.title} className="event-banner" />
              ) : (
                <div className="event-banner-placeholder">🎪</div>
              )}

              <div className="event-body">
                <span className="event-date">
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD'}
                </span>

                <h2 className="event-title">{event.title}</h2>
                
                {event.description && (
                  <div className="event-description">{event.description}</div>
                )}

                <div className="event-footer">
                  <span>By {event.organizerName ?? 'Admin'}</span>
                  <span className="btn-register">Register Now</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </>
  );
}
