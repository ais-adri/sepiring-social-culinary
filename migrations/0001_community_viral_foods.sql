CREATE TABLE IF NOT EXISTS community_viral_foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  area TEXT NOT NULL,
  tag TEXT NOT NULL,
  heat INTEGER NOT NULL DEFAULT 1,
  submitted_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_community_viral_foods_created_at
  ON community_viral_foods (created_at DESC);
