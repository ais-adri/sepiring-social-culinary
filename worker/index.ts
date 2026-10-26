import { collectViralNews } from "./news";

export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  YOUTUBE_API_KEY?: string;
}

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const DEFAULT_QUERY = "makanan viral indonesia";
// Keywords crawled on every scheduled run. Each search costs 100 YouTube quota units.
const CRAWL_QUERIES = [
  DEFAULT_QUERY,
  "jajanan viral",
  "kuliner viral indonesia",
  "street food viral indonesia",
];
const MAX_RESULTS = 12;
const LOOKBACK_DAYS = 21;

const MAX_LEN = { name: 80, origin: 80, area: 60, tag: 60, submittedBy: 60 };

type ViralFoodItem = {
  id: string;
  name: string;
  origin: string;
  area: string;
  heat: number;
  tag: string;
  image: string;
  videoUrl: string;
};

type YouTubeVideo = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
};

type ViralFoodRow = {
  video_id: string;
  title: string;
  channel: string;
  thumbnail: string;
  video_url: string;
  view_count: number;
};

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}jt views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}rb views`;
  return `${count} views`;
}

function heatFromRank(index: number, total: number): number {
  const percentile = index / Math.max(total - 1, 1);
  if (percentile <= 1 / 3) return 3;
  if (percentile <= 2 / 3) return 2;
  return 1;
}

function clean(value: unknown, maxLen: number, fallback = ""): string {
  const str = typeof value === "string" ? value.trim() : "";
  return (str || fallback).slice(0, maxLen);
}

function lookbackDate(): string {
  return new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function toItem(
  video: { id: string; title: string; channel: string; thumbnail: string; viewCount: number },
  index: number,
  total: number
): ViralFoodItem {
  return {
    id: video.id,
    name: video.title,
    origin: video.channel,
    area: "YouTube",
    heat: heatFromRank(index, total),
    tag: `🔥 ${formatViews(video.viewCount)}`,
    image: video.thumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

// Most-viewed recent food videos for a query, sorted by view count.
async function searchYouTube(apiKey: string, query: string): Promise<YouTubeVideo[]> {
  const searchParams = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    q: query,
    order: "viewCount",
    regionCode: "ID",
    relevanceLanguage: "id",
    publishedAfter: lookbackDate(),
    maxResults: String(MAX_RESULTS),
  });

  const searchRes = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams.toString()}`);
  if (!searchRes.ok) {
    throw new Error(`YouTube search failed: ${searchRes.status}`);
  }
  const searchData: any = await searchRes.json();
  const videoIds: string[] = (searchData.items ?? [])
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);
  if (videoIds.length === 0) return [];

  const videosParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,statistics",
    id: videoIds.join(","),
  });

  const videosRes = await fetch(`${YOUTUBE_VIDEOS_URL}?${videosParams.toString()}`);
  if (!videosRes.ok) {
    throw new Error(`YouTube videos lookup failed: ${videosRes.status}`);
  }
  const videosData: any = await videosRes.json();

  return (videosData.items ?? [])
    .map((video: any) => ({
      videoId: video.id,
      title: video.snippet?.title ?? "Video makanan viral",
      channel: video.snippet?.channelTitle ?? "YouTube",
      thumbnail: video.snippet?.thumbnails?.medium?.url ?? video.snippet?.thumbnails?.default?.url ?? "",
      viewCount: Number(video.statistics?.viewCount ?? 0),
      publishedAt: video.snippet?.publishedAt ?? new Date().toISOString(),
    }))
    .sort((a: YouTubeVideo, b: YouTubeVideo) => b.viewCount - a.viewCount);
}

// Crawl every keyword and upsert the videos into D1. Returns how many rows were written.
async function collectViralFoods(env: Env): Promise<number> {
  if (!env.YOUTUBE_API_KEY || !env.DB) return 0;
  const db = env.DB;

  const upsert = db.prepare(
    `INSERT INTO viral_foods (video_id, title, channel, thumbnail, video_url, view_count, published_at, search_query)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (video_id) DO UPDATE SET
       title = excluded.title,
       channel = excluded.channel,
       thumbnail = excluded.thumbnail,
       view_count = excluded.view_count,
       last_seen_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
  );

  let written = 0;
  for (const query of CRAWL_QUERIES) {
    try {
      const videos = await searchYouTube(env.YOUTUBE_API_KEY, query);
      if (videos.length === 0) continue;
      await db.batch(
        videos.map((v) =>
          upsert.bind(
            v.videoId,
            v.title,
            v.channel,
            v.thumbnail,
            `https://www.youtube.com/watch?v=${v.videoId}`,
            v.viewCount,
            v.publishedAt,
            query
          )
        )
      );
      written += videos.length;
    } catch (error) {
      console.error(`Crawl failed for "${query}":`, (error as Error).message);
    }
  }
  return written;
}

async function readViralFoodsFromDb(db: D1Database): Promise<ViralFoodItem[]> {
  const { results } = await db
    .prepare(
      `SELECT video_id, title, channel, thumbnail, video_url, view_count
       FROM viral_foods
       WHERE published_at >= ?
       ORDER BY view_count DESC
       LIMIT ?`
    )
    .bind(lookbackDate(), MAX_RESULTS)
    .all<ViralFoodRow>();
  return results.map((row, index) =>
    toItem(
      { id: row.video_id, title: row.title, channel: row.channel, thumbnail: row.thumbnail, viewCount: row.view_count },
      index,
      results.length
    )
  );
}

async function viralFoods(request: Request, env: Env): Promise<Response> {
  const cacheHeaders = { "Cache-Control": "public, max-age=600" };

  try {
    if (env.DB) {
      let items = await readViralFoodsFromDb(env.DB);
      // First request after deploy: the cron hasn't run yet, so crawl now.
      if (items.length === 0 && (await collectViralFoods(env)) > 0) {
        items = await readViralFoodsFromDb(env.DB);
      }
      if (items.length > 0) return json({ source: "database", items }, 200, cacheHeaders);
    }

    if (!env.YOUTUBE_API_KEY) {
      return json({ source: "fallback", items: [], reason: "missing_api_key" });
    }

    // No database bound: query YouTube live.
    const q = new URL(request.url).searchParams.get("q")?.trim();
    const videos = await searchYouTube(env.YOUTUBE_API_KEY, q || DEFAULT_QUERY);
    if (videos.length === 0) {
      return json({ source: "fallback", items: [], reason: "no_results" });
    }
    const items = videos.map((v, index) =>
      toItem({ id: v.videoId, title: v.title, channel: v.channel, thumbnail: v.thumbnail, viewCount: v.viewCount }, index, videos.length)
    );
    return json({ source: "youtube", items }, 200, cacheHeaders);
  } catch (error) {
    return json({ source: "fallback", items: [], reason: "error", message: (error as Error).message });
  }
}

const ARCHIVE_QUERIES = {
  youtube: {
    select: `SELECT video_id, title, channel, thumbnail, video_url, view_count, published_at,
                    search_query, first_seen_at, last_seen_at
             FROM viral_foods
             ORDER BY last_seen_at DESC, view_count DESC
             LIMIT ? OFFSET ?`,
    count: "SELECT COUNT(*) AS n FROM viral_foods",
  },
  news: {
    select: `SELECT article_id, title, publisher, publisher_url, url, published_at,
                    search_query, first_seen_at, last_seen_at
             FROM viral_food_news
             ORDER BY published_at DESC
             LIMIT ? OFFSET ?`,
    count: "SELECT COUNT(*) AS n FROM viral_food_news",
  },
};

// Everything stored in the database, for browsing. `source` is "youtube" (default) or "news".
async function viralFoodsArchive(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return json({ items: [], total: 0, reason: "missing_database" });
  const params = new URL(request.url).searchParams;
  const source = params.get("source") === "news" ? "news" : "youtube";
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 50));
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const queries = ARCHIVE_QUERIES[source];

  try {
    const [{ results }, total] = await Promise.all([
      env.DB.prepare(queries.select).bind(limit, offset).all(),
      env.DB.prepare(queries.count).first<number>("n"),
    ]);
    return json({ source, items: results, total: total ?? 0, limit, offset }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
}

async function communityViralFoods(request: Request, env: Env): Promise<Response> {
  const db = env.DB;
  if (!db) {
    if (request.method === "GET") {
      return json({ items: [], reason: "missing_database" });
    }
    return json({ error: "Database belum di-setup di server ini." }, 503);
  }

  try {
    if (request.method === "GET") {
      const { results } = await db
        .prepare(
          `SELECT id, name, origin, area, tag, heat, submitted_by, created_at
           FROM community_viral_foods
           ORDER BY created_at DESC
           LIMIT 30`
        )
        .all();
      return json({ items: results }, 200, { "Cache-Control": "no-store" });
    }

    if (request.method === "POST") {
      const body: any = await request.json().catch(() => ({}));
      const name = clean(body?.name, MAX_LEN.name);
      if (!name) {
        return json({ error: "Nama makanan wajib diisi." }, 400);
      }

      const origin = clean(body.origin, MAX_LEN.origin, "Komunitas Sepiring");
      const area = clean(body.area, MAX_LEN.area, "-");
      const tag = clean(body.tag, MAX_LEN.tag, "Dari komunitas");
      const submittedBy = clean(body.submittedBy, MAX_LEN.submittedBy) || null;
      const heat = Math.min(3, Math.max(1, Number(body.heat) || 1));

      const item = await db
        .prepare(
          `INSERT INTO community_viral_foods (name, origin, area, tag, heat, submitted_by)
           VALUES (?, ?, ?, ?, ?, ?)
           RETURNING id, name, origin, area, tag, heat, submitted_by, created_at`
        )
        .bind(name, origin, area, tag, heat, submittedBy)
        .first();
      return json({ item }, 201);
    }

    return json({ error: "Method not allowed" }, 405, { Allow: "GET, POST" });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/viral-foods") return viralFoods(request, env);
    if (pathname === "/api/viral-foods/archive") return viralFoodsArchive(request, env);
    if (pathname === "/api/community-viral-foods") return communityViralFoods(request, env);
    if (pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);

    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      collectViralFoods(env).then((n) => console.log(`Stored ${n} viral food videos`))
    );
    if (env.DB) {
      ctx.waitUntil(
        collectViralNews(env.DB).then((n) => console.log(`Stored ${n} viral food news articles`))
      );
    }
  },
} satisfies ExportedHandler<Env>;
