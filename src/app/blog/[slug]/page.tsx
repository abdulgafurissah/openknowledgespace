import { getSubstackPosts, getSubstackPost, SUBSTACK_URL } from '@/lib/substack';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from '../blog.module.css';

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getSubstackPosts();
  return posts
    .filter((post) => post.link)
    .map((post) => ({
      slug: post.link.split('/').filter(Boolean).pop() ?? post.guid,
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
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <main className={styles.blogMain}>
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
              Read & Comment on Substack ↗
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
  );
}
