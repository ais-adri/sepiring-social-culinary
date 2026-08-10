import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql, ensureViralFoodTable } from "../lib/db";

const MAX_LEN = { name: 80, origin: 80, area: 60, tag: 60, submittedBy: 60 };

function clean(value: unknown, maxLen: number, fallback = ""): string {
  const str = typeof value === "string" ? value.trim() : "";
  return (str || fallback).slice(0, maxLen);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.POSTGRES_URL) {
    if (req.method === "GET") {
      res.status(200).json({ items: [], reason: "missing_database" });
      return;
    }
    res.status(503).json({ error: "Database belum di-setup di server ini." });
    return;
  }

  try {
    await ensureViralFoodTable();

    if (req.method === "GET") {
      const { rows } = await sql`
        SELECT id, name, origin, area, tag, heat, submitted_by, created_at
        FROM community_viral_foods
        ORDER BY created_at DESC
        LIMIT 30
      `;
      res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=120");
      res.status(200).json({ items: rows });
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
      const name = clean(body.name, MAX_LEN.name);
      if (!name) {
        res.status(400).json({ error: "Nama makanan wajib diisi." });
        return;
      }

      const origin = clean(body.origin, MAX_LEN.origin, "Komunitas Sepiring");
      const area = clean(body.area, MAX_LEN.area, "-");
      const tag = clean(body.tag, MAX_LEN.tag, "Dari komunitas");
      const submittedBy = clean(body.submittedBy, MAX_LEN.submittedBy) || null;
      const heat = Math.min(3, Math.max(1, Number(body.heat) || 1));

      const { rows } = await sql`
        INSERT INTO community_viral_foods (name, origin, area, tag, heat, submitted_by)
        VALUES (${name}, ${origin}, ${area}, ${tag}, ${heat}, ${submittedBy})
        RETURNING id, name, origin, area, tag, heat, submitted_by, created_at
      `;
      res.status(201).json({ item: rows[0] });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
