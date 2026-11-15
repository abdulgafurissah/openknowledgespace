import { getSubstackPosts, SUBSTACK_URL } from '@/lib/substack';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog & Articles | Open Knowledge Space',
  description: 'Insights on religion, faith, and mental health — published on Open Knowledge Space.',
};

// Revalidate every 60 seconds so newly published Substack posts show up promptly
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getSubstackPosts();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary, #f4efe6)' }}>
      <Navbar />

      <main className={styles.blogMain} style={{ flex: 1 }}>
        {/* Header */}
        <section className={styles.blogHero}>
          <div className={styles.heroInner}>
            <span className={styles.heroTag}>✦ From Our Newsletter</span>
            <h1 className={styles.heroTitle}>Articles &amp; Insights</h1>
            <p className={styles.heroSub}>
              Reflections on religion, faith, and mental health — delivered fresh from our Substack publication.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <a
                href={`${SUBSTACK_URL}?utm_source=oks_website`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.substackBtn}
              >
                Subscribe on Substack →
              </a>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className={styles.postsSection}>
          <div className={styles.postsGrid}>
            {posts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✦</div>
                <h2>No articles yet</h2>
                <p>We haven&apos;t published any articles yet. Follow us on Substack to get notified when we do!</p>
                <a
                  href={`${SUBSTACK_URL}?utm_source=oks_website`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.substackBtn}
                >
                  Follow on Substack
                </a>
              </div>
            ) : (
              posts.map((post) => {
                const slug = post.link ? post.link.split('?')[0].split('/').filter(Boolean).pop() ?? post.guid : post.guid;
                const date = new Date(post.pubDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <article key={post.guid} className={styles.postCard}>
                    {post.thumbnail && (
                      <div className={styles.cardThumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.thumbnail} alt={post.title} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <time className={styles.cardDate}>{date}</time>
                      <h2 className={styles.cardTitle}>{post.title}</h2>
                      <p className={styles.cardExcerpt}>{post.description}</p>
                      <div className={styles.cardActions}>
                        <Link href={`/blog/${slug}`} className={styles.readMore}>
                          Read Article
                        </Link>
                        <a
                          href={`${post.link}?utm_source=oks_website`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.readSubstack}
                        >
                          Read on Substack ↗
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Substack Subscribe Embed */}
        <section className={styles.subscribeSection}>
          <div className={styles.subscribeInner}>
            <h2 className={styles.subscribeTitle}>Stay in the Loop</h2>
            <p className={styles.subscribeSub}>
              Get our latest articles on religion, faith, and mental health delivered straight to your inbox.
            </p>
            <iframe
              src={`${SUBSTACK_URL}/embed`}
              width="100%"
              height="150"
              style={{ background: 'transparent', border: 'none' }}
              frameBorder="0"
              scrolling="no"
              title="Subscribe to Open Knowledge Space on Substack"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-dark, #121214)', color: 'var(--text-on-dark, #f4efe6)', padding: '3rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Image src="/logo.png" alt="Open Knowledge Space Logo" width={140} height={50} style={{ objectFit: 'contain' }} />
          </div>
          <p style={{ color: 'var(--text-on-dark-muted, #8a8479)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            &ldquo;And say: My Lord, increase me in knowledge.&rdquo; &mdash; Surah Ta-Ha 20:114
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono, sans-serif)', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-on-dark, #f4efe6)', textDecoration: 'none' }}>Home</Link>
            <Link href="/courses" style={{ color: 'var(--text-on-dark, #f4efe6)', textDecoration: 'none' }}>Courses</Link>
            <Link href="/events" style={{ color: 'var(--text-on-dark, #f4efe6)', textDecoration: 'none' }}>Events</Link>
            <Link href="/suq" style={{ color: 'var(--accent-primary, #d4a843)', textDecoration: 'none' }}>Open Suq</Link>
            <Link href="/blog" style={{ color: 'var(--text-on-dark, #f4efe6)', textDecoration: 'none' }}>Blog</Link>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-on-dark-muted, #8a8479)' }}>
            &copy; {new Date().getFullYear()} Open Knowledge Space. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
