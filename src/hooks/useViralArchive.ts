import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export type ArchiveVideo = {
  video_id: string;
  title: string;
  channel: string;
  thumbnail: string;
  video_url: string;
  view_count: number;
  published_at: string;
  search_query: string;
  first_seen_at: string;
  last_seen_at: string;
};

export type ArchiveNews = {
  article_id: string;
  title: string;
  publisher: string;
  publisher_url: string;
  url: string;
  published_at: string;
  search_query: string;
  first_seen_at: string;
  last_seen_at: string;
};

type ArchiveItem = { youtube: ArchiveVideo; news: ArchiveNews };

type ArchivePage<S extends keyof ArchiveItem> = {
  items: ArchiveItem[S][];
  total: number;
  offset: number;
};

export function useViralArchive<S extends keyof ArchiveItem>(source: S) {
  return useInfiniteQuery({
    queryKey: ["viral-archive", source],
    queryFn: async ({ pageParam }): Promise<ArchivePage<S>> => {
      const params = new URLSearchParams({ source, limit: String(PAGE_SIZE), offset: String(pageParam) });
      const res = await fetch(`/api/viral-foods/archive?${params.toString()}`);
      if (!res.ok) throw new Error(`Gagal memuat arsip: ${res.status}`);
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.items.length;
      return lastPage.items.length > 0 && next < lastPage.total ? next : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}
