import { getSubstackPosts, SUBSTACK_URL } from '@/lib/substack';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog & Articles | Open Knowledge Space',
  description: 'Insights on religion, faith, and mental health — published on Open Knowledge Space.',
};

export const revalidate = 3600; // Refresh every hour

export default async function BlogPage() {
  const posts = await getSubstackPosts();

  return (
    <main className={styles.blogMain}>
      {/* Header */}
      <section className={styles.blogHero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>✦ From Our Newsletter</span>
          <h1 className={styles.heroTitle}>Articles & Insights</h1>
          <p className={styles.heroSub}>
            Reflections on religion, faith, and mental health — delivered fresh from our Substack publication.
          </p>
          <a
            href={`${SUBSTACK_URL}?utm_source=oks_website`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.substackBtn}
          >
            Subscribe on Substack →
          </a>
        </div>
      </section>

      {/* Posts Grid */}
      <section className={styles.postsSection}>
        <div className={styles.postsGrid}>
          {posts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✦</div>
              <h2>No articles yet</h2>
              <p>We haven't published any articles yet. Follow us on Substack to get notified when we do!</p>
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
              const slug = post.link.split('/').pop() ?? post.guid;
              const date = new Date(post.pubDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
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
  );
}
