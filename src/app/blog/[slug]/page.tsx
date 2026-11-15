import { getSubstackPosts, getSubstackPost, SUBSTACK_URL } from '@/lib/substack';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import styles from '../blog.module.css';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getSubstackPosts();
  return posts
    .filter((post) => post.link)
    .map((post) => ({
      slug: post.link.split('?')[0].split('/').filter(Boolean).pop() ?? post.guid,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getSubstackPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | Open Knowledge Space`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getSubstackPost(slug);
  if (!post) notFound();

  const date = new Date(post.pubDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary, #f4efe6)' }}>
      <Navbar />

      <main className={styles.blogMain} style={{ flex: 1 }}>
        <article className={styles.postArticle}>
          {/* Back */}
          <Link href="/blog" className={styles.backLink}>← Back to Articles</Link>

          {/* Hero Thumbnail */}
          {post.thumbnail && (
            <div className={styles.articleThumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.thumbnail} alt={post.title} />
            </div>
          )}

          {/* Header */}
          <header className={styles.articleHeader}>
            <time className={styles.cardDate}>{date}</time>
            <h1 className={styles.articleTitle}>{post.title}</h1>
            <div className={styles.articleActions}>
              <a
                href={`${post.link}?utm_source=oks_website`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.substackBtn}
              >
                Read &amp; Comment on Substack ↗
              </a>
            </div>
          </header>

          {/* Full Content */}
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer CTA */}
          <footer className={styles.articleFooter}>
            <div className={styles.subscribeInner} style={{ marginTop: 0 }}>
              <h2 className={styles.subscribeTitle}>Enjoyed this article?</h2>
              <p className={styles.subscribeSub}>
                Subscribe to get more articles like this delivered to your inbox.
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
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/blog" className={styles.readMore}>← All Articles</Link>
              <a
                href={`${post.link}?utm_source=oks_website`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.readSubstack}
              >
                View on Substack ↗
              </a>
            </div>
          </footer>
        </article>
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
