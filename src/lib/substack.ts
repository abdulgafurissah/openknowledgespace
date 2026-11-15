// ─── Substack RSS Integration ─────────────────────────────────────────────────
// Fetches posts from openknowledgespace.substack.com RSS feed.
// Revalidates frequently (60s) so new posts appear promptly on the website.

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;     // Short excerpt (HTML stripped)
  content: string;         // Full post content (HTML)
  thumbnail: string | null;
  guid: string;
}

const SUBSTACK_URL = process.env.NEXT_PUBLIC_SUBSTACK_URL || 'https://openknowledgespace.substack.com';
const RSS_URL = `${SUBSTACK_URL.replace(/\/$/, '')}/feed`;

/** Extract text from a CDATA or plain string segment */
function extractCDATA(str: string): string {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

/** Extract the value between XML tags */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? extractCDATA(m[1]) : '';
}

/** Strip HTML tags to get plain text */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract thumbnail image from item XML or HTML content */
function extractThumbnail(itemXml: string, contentHtml: string): string | null {
  // 1. Check enclosure tag
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosureMatch) return enclosureMatch[1];

  // 2. Check media:content tag
  const mediaMatch = itemXml.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaMatch) return mediaMatch[1];

  // 3. Check <img> tag in HTML content
  const imgMatch = contentHtml.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) return imgMatch[1];

  return null;
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
    const thumbnail   = extractThumbnail(item, content);
    const guid        = extractTag(item, 'guid') || link;

    if (title && link) {
      posts.push({ title, link, pubDate, description, content, thumbnail, guid });
    }
  }

  return posts;
}

/** Fetch all posts from Substack RSS — cached for 60 seconds */
export async function getSubstackPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) {
      console.warn(`[Substack RSS] Received HTTP ${res.status} from ${RSS_URL}`);
      return [];
    }
    const xml = await res.text();
    return parseRSS(xml);
  } catch (err) {
    console.error('[Substack RSS Error]', err);
    return [];
  }
}

/** Get a single post by matching its URL slug */
export async function getSubstackPost(slug: string): Promise<SubstackPost | null> {
  const posts = await getSubstackPosts();
  const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();

  return (
    posts.find(p => {
      const postSlug = p.link.split('?')[0].split('/').filter(Boolean).pop()?.toLowerCase() || '';
      const guidSlug = p.guid.split('?')[0].split('/').filter(Boolean).pop()?.toLowerCase() || '';
      return (
        postSlug === normalizedSlug ||
        guidSlug === normalizedSlug ||
        p.link.toLowerCase().includes(normalizedSlug) ||
        p.guid.toLowerCase().includes(normalizedSlug)
      );
    }) ?? null
  );
}

export { SUBSTACK_URL };
