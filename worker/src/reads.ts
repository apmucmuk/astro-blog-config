import { ApiError } from "../../src/core/api";
import { ensureArticleStats } from "./d1";
import type { D1Database } from "./types";

export async function recordRead(db: D1Database, siteId: string, articleId: string, now = Date.now()) {
  if (!db.batch) throw new ApiError(500, "INTERNAL_ERROR", "Atomic storage is unavailable.");
  await ensureArticleStats(db, siteId, articleId, now);
  const day = new Date(now).toISOString().slice(0, 10);
  const results = await db.batch([
    db.prepare(`UPDATE article_stats SET reads = reads + 1, updated_at_ms = MAX(updated_at_ms, ?)
      WHERE site_id = ? AND article_id = ?`).bind(now, siteId, articleId),
    db.prepare(`INSERT INTO article_read_daily (site_id, article_id, day_utc, reads, updated_at_ms)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(site_id, article_id, day_utc) DO UPDATE SET
      reads = article_read_daily.reads + 1,
      updated_at_ms = MAX(article_read_daily.updated_at_ms, excluded.updated_at_ms)`)
      .bind(siteId, articleId, day, now),
  ]);
  if (results.some((result) => !result.success)) throw new ApiError(500, "INTERNAL_ERROR", "Read could not be recorded.");
  return { accepted: true as const };
}
