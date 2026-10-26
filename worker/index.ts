export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  YOUTUBE_API_KEY?: string;
}

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const DEFAULT_QUERY = "makanan viral indonesia";
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

async function viralFoods(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return json({ source: "fallback", items: [], reason: "missing_api_key" });
  }

  // Cache successful YouTube responses at the edge to save API quota.
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const q = new URL(request.url).searchParams.get("q")?.trim();
    const query = q || DEFAULT_QUERY;
    const publishedAfter = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const searchParams = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      q: query,
      order: "viewCount",
      regionCode: "ID",
      relevanceLanguage: "id",
      publishedAfter,
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

    if (videoIds.length === 0) {
      return json({ source: "fallback", items: [], reason: "no_results" });
    }

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

    const sorted = [...(videosData.items ?? [])].sort(
      (a: any, b: any) => Number(b.statistics?.viewCount ?? 0) - Number(a.statistics?.viewCount ?? 0)
    );

    const items: ViralFoodItem[] = sorted.map((video: any, index: number) => {
      const viewCount = Number(video.statistics?.viewCount ?? 0);
      return {
        id: video.id,
        name: video.snippet?.title ?? "Video makanan viral",
        origin: video.snippet?.channelTitle ?? "YouTube",
        area: "YouTube",
        heat: heatFromRank(index, sorted.length),
        tag: `🔥 ${formatViews(viewCount)}`,
        image: video.snippet?.thumbnails?.medium?.url ?? video.snippet?.thumbnails?.default?.url ?? "",
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      };
    });

    const response = json(
      { source: "youtube", items },
      200,
      { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" }
    );
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    return json({ source: "fallback", items: [], reason: "error", message: (error as Error).message });
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
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/viral-foods") return viralFoods(request, env, ctx);
    if (pathname === "/api/community-viral-foods") return communityViralFoods(request, env);
    if (pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
