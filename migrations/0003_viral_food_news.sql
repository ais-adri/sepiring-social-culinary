-- Viral food news articles collected from Google News RSS by the scheduled Worker.
CREATE TABLE IF NOT EXISTS viral_food_news (
  article_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publisher_url TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  search_query TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_viral_food_news_published
  ON viral_food_news (published_at DESC);
