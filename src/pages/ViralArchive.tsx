import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeftIcon, ExternalLinkIcon, FlameIcon, NewspaperIcon, PlayCircleIcon, UtensilsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useViralArchive } from "@/hooks/useViralArchive";

function timeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: localeId });
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}jt views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}rb views`;
  return `${count} views`;
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <UtensilsIcon className="w-8 h-8 text-primary/50" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function LoadMore({ hasNextPage, isFetching, onClick }: { hasNextPage: boolean; isFetching: boolean; onClick: () => void }) {
  if (!hasNextPage) return null;
  return (
    <Button variant="outline" className="rounded-full self-center mt-2" disabled={isFetching} onClick={onClick}>
      {isFetching ? "Memuat..." : "Muat lagi"}
    </Button>
  );
}

function VideoList() {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useViralArchive("youtube");
  const videos = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isLoading) return <ListSkeleton />;
  if (isError) return <EmptyState text="Arsip video belum bisa dimuat. Coba lagi nanti ya." />;
  if (videos.length === 0) return <EmptyState text="Belum ada video tersimpan. Data dikumpulkan otomatis tiap 6 jam." />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{total} video tersimpan</p>
      {videos.map((video) => (
        <a
          key={video.video_id}
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-2xl border border-border shadow-sm flex gap-3 overflow-hidden"
          data-testid={`archive-video-${video.video_id}`}
        >
          <div className="relative w-32 shrink-0 bg-muted">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircleIcon className="w-8 h-8 text-primary/50" />
              </div>
            )}
          </div>
          <div className="py-3 pr-3 flex flex-col gap-1 min-w-0">
            <p className="font-bold text-sm leading-tight line-clamp-2">{video.title}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {video.channel} · {timeAgo(video.published_at)}
            </p>
            <span className="inline-flex items-center gap-1 self-start text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full mt-1">
              <FlameIcon className="w-3 h-3" />
              {formatViews(video.view_count)}
            </span>
          </div>
        </a>
      ))}
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
    </div>
  );
}

function NewsList() {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useViralArchive("news");
  const articles = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isLoading) return <ListSkeleton />;
  if (isError) return <EmptyState text="Arsip berita belum bisa dimuat. Coba lagi nanti ya." />;
  if (articles.length === 0) return <EmptyState text="Belum ada berita tersimpan. Data dikumpulkan otomatis tiap 6 jam." />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{total} berita tersimpan</p>
      {articles.map((article) => (
        <a
          key={article.article_id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-2xl border border-border shadow-sm p-4 flex gap-3"
          data-testid={`archive-news-${article.article_id}`}
        >
          <NewspaperIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <p className="font-bold text-sm leading-tight">{article.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {article.publisher} · {timeAgo(article.published_at)}
            </p>
          </div>
          <ExternalLinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      ))}
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
    </div>
  );
}

export default function ViralArchive() {
  const [tab, setTab] = useState("youtube");

  return (
    <div className="flex flex-col gap-5 pb-8 px-5 pt-6">
      <section>
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ChevronLeftIcon className="w-4 h-4" /> Beranda
        </Link>
        <h2 className="font-serif text-3xl text-primary font-bold mb-2">Arsip Makanan Viral</h2>
        <p className="text-muted-foreground text-sm">
          Kumpulan video dan berita kuliner viral yang dikumpulkan Sepiring dari internet selama 2 bulan terakhir, diperbarui tiap 6 jam.
        </p>
      </section>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
        <TabsList className="w-full rounded-full">
          <TabsTrigger value="youtube" className="flex-1 rounded-full gap-1.5" data-testid="tab-archive-youtube">
            <PlayCircleIcon className="w-4 h-4" /> Video
          </TabsTrigger>
          <TabsTrigger value="news" className="flex-1 rounded-full gap-1.5" data-testid="tab-archive-news">
            <NewspaperIcon className="w-4 h-4" /> Berita
          </TabsTrigger>
        </TabsList>
        <TabsContent value="youtube" className="mt-0">
          <VideoList />
        </TabsContent>
        <TabsContent value="news" className="mt-0">
          <NewsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
