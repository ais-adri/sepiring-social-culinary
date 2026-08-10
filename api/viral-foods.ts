import type { VercelRequest, VercelResponse } from "@vercel/node";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const DEFAULT_QUERY = "makanan viral indonesia";
const MAX_RESULTS = 12;
const LOOKBACK_DAYS = 21;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    res.status(200).json({ source: "fallback", items: [], reason: "missing_api_key" });
    return;
  }

  try {
    const query = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q : DEFAULT_QUERY;
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
    const searchData = await searchRes.json();
    const videoIds: string[] = (searchData.items ?? [])
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      res.status(200).json({ source: "fallback", items: [], reason: "no_results" });
      return;
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
    const videosData = await videosRes.json();

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

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ source: "youtube", items });
  } catch (error) {
    res.status(200).json({ source: "fallback", items: [], reason: "error", message: (error as Error).message });
  }
}
