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
          padding: 5rem 2rem 3.5rem;
          text-align: center;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .events-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .events-hero p {
          font-family: var(--font-body);
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          padding: 4.5rem 2rem 6rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .event-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          overflow: hidden;
          transition: all var(--transition-normal);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        .event-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), #ecd183);
          opacity: 0;
          transition: opacity var(--transition-normal);
          z-index: 2;
        }
        .event-card:hover {
          transform: translateY(-5px);
          border-color: var(--gold-border);
          box-shadow: var(--shadow-lg), 0 0 24px rgba(212, 168, 67, 0.15);
        }
        .event-card:hover::before {
          opacity: 1;
        }
        .event-banner {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .event-card:hover .event-banner {
          transform: scale(1.03);
        }
        .event-banner-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .event-body {
          padding: 1.6rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .event-date {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          padding: 0.35rem 0.9rem;
          border-radius: var(--radius-full);
          font-family: var(--font-mono);
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #ffffff;
          color: var(--text-primary);
          border: 1.5px solid var(--gold);
          width: fit-content;
          box-shadow: var(--shadow-sm);
        }
        .event-title {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .event-description {
          font-family: var(--font-body);
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.65;
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
          font-family: var(--font-body);
        }
        .btn-register {
          background: var(--bg-dark);
          color: var(--accent-primary);
          padding: 0.55rem 1.35rem;
          border-radius: var(--radius-full);
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all var(--transition-fast);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .event-card:hover .btn-register {
          background: var(--accent-primary);
          color: var(--bg-dark);
          transform: translateY(-1px);
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
