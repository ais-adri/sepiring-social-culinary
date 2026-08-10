import { sql } from "@vercel/postgres";

let tableReady: Promise<unknown> | null = null;

export function ensureViralFoodTable() {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS community_viral_foods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        origin TEXT NOT NULL,
        area TEXT NOT NULL,
        tag TEXT NOT NULL,
        heat SMALLINT NOT NULL DEFAULT 1,
        submitted_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  return tableReady;
}

export { sql };
