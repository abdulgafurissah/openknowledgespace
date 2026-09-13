// ─── Substack RSS Integration ─────────────────────────────────────────────────
// Fetches posts from openknowledgespace.substack.com RSS feed.
// The feed is cached for 1 hour (revalidate: 3600) to avoid rate limiting.

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;     // Short excerpt (HTML stripped)
  content: string;         // Full post content (HTML)
  thumbnail: string | null;
  guid: string;
}

const RSS_URL = 'https://openknowledgespace.substack.com/feed';
const SUBSTACK_URL = 'https://openknowledgespace.substack.com';

/** Extract text from a CDATA or plain string segment */
function extractCDATA(str: string): string {
  return str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
}

/** Extract the value between XML tags */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? extractCDATA(m[1]) : '';
}

/** Strip HTML tags to get plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

/** Extract first image from HTML content */
function extractThumbnail(html: string): string | null {
  const m = html.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : null;
}

/** Parse RSS XML string into SubstackPost array */
function parseRSS(xml: string): SubstackPost[] {
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  const posts: SubstackPost[] = [];
  let match;

  while ((match = itemRe.exec(xml)) !== null) {
    const item = match[1];
    const title       = stripHtml(extractTag(item, 'title'));
    const link        = extractTag(item, 'link').trim() || extractTag(item, 'guid').trim();
    const pubDate     = extractTag(item, 'pubDate');
    const description = stripHtml(extractTag(item, 'description')).slice(0, 280);
    const content     = extractTag(item, 'content:encoded') || extractTag(item, 'description');
    const thumbnail   = extractThumbnail(content);
    const guid        = extractTag(item, 'guid') || link;

    if (title && link) {
      posts.push({ title, link, pubDate, description, content, thumbnail, guid });
    }
  }

  return posts;
}

/** Fetch all posts from Substack RSS — cached for 1 hour */
export async function getSubstackPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'OpenKnowledgeSpace/1.0' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml);
  } catch {
    return [];
  }
}

/** Get a single post by matching its URL slug */
export async function getSubstackPost(slug: string): Promise<SubstackPost | null> {
  const posts = await getSubstackPosts();
  return posts.find(p => p.link.includes(slug)) ?? null;
}

export { SUBSTACK_URL };
