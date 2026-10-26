-- Viral food videos collected from YouTube by the scheduled Worker.
-- One row per video; view_count and last_seen_at are refreshed on every crawl.
CREATE TABLE IF NOT EXISTS viral_foods (
  video_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  thumbnail TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL,
  search_query TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_viral_foods_published_views
  ON viral_foods (published_at, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_viral_foods_last_seen
  ON viral_foods (last_seen_at DESC);
