// Viral food news collected from Google News RSS (free, no API key).

const GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search";
// Keywords crawled on every scheduled run. `when:7d` limits results to the last week.
const NEWS_QUERIES = ["makanan viral", "kuliner viral", "jajanan viral"];
const MAX_ARTICLES_PER_QUERY = 20;

export type NewsArticle = {
  articleId: string;
  title: string;
  publisher: string;
  publisherUrl: string;
  url: string;
  publishedAt: string;
};

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decodeEntities(match[1]) : "";
}

// Workers have no DOMParser, and the Google News feed is flat enough for a regex parser.
export function parseGoogleNewsRss(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  for (const [, block] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const url = tag(block, "link");
    const articleId = tag(block, "guid") || url;
    if (!url || !articleId) continue;

    const publisher = tag(block, "source");
    const publisherUrl = decodeEntities(block.match(/<source[^>]*\surl="([^"]*)"/)?.[1] ?? "");
    let title = tag(block, "title");
    // Google News appends " - Publisher" to every title.
    if (publisher && title.endsWith(` - ${publisher}`)) {
      title = title.slice(0, -(publisher.length + 3));
    }

    const pubDate = new Date(tag(block, "pubDate"));
    articles.push({
      articleId,
      title: title || "Berita makanan viral",
      publisher: publisher || "Google News",
      publisherUrl,
      url,
      publishedAt: Number.isNaN(pubDate.getTime()) ? new Date().toISOString() : pubDate.toISOString(),
    });
  }
  return articles;
}

async function searchGoogleNews(query: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams({ q: `${query} when:7d`, hl: "id", gl: "ID", ceid: "ID:id" });
  const res = await fetch(`${GOOGLE_NEWS_RSS_URL}?${params.toString()}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SepiringBot/1.0)" },
  });
  if (!res.ok) {
    throw new Error(`Google News fetch failed: ${res.status}`);
  }
  return parseGoogleNewsRss(await res.text()).slice(0, MAX_ARTICLES_PER_QUERY);
}

// Crawl every keyword and upsert the articles into D1. Returns how many rows were written.
export async function collectViralNews(db: D1Database): Promise<number> {
  const upsert = db.prepare(
    `INSERT INTO viral_food_news (article_id, title, publisher, publisher_url, url, published_at, search_query)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (article_id) DO UPDATE SET
       title = excluded.title,
       last_seen_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
  );

  let written = 0;
  for (const query of NEWS_QUERIES) {
    try {
      const articles = await searchGoogleNews(query);
      if (articles.length === 0) continue;
      await db.batch(
        articles.map((a) =>
          upsert.bind(a.articleId, a.title, a.publisher, a.publisherUrl, a.url, a.publishedAt, query)
        )
      );
      written += articles.length;
    } catch (error) {
      console.error(`News crawl failed for "${query}":`, (error as Error).message);
    }
  }
  return written;
}
