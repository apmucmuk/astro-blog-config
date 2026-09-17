import type { StatsSnapshot } from "../../src/core/api/reads";
import { ApiError } from "../../src/core/api";
import type { D1Database } from "./types";

type Row = {
  article_id: string; publish_at_ms: number; reads: number; comments_count: number;
  rating_sum: number; rating_count: number; rolling_reads: number;
};

export async function getStats(db: D1Database, siteId: string, windowDays: number, priorWeight = 10, now = Date.now()): Promise<StatsSnapshot> {
  if (!Number.isInteger(windowDays) || windowDays < 1 || !Number.isFinite(priorWeight) || priorWeight <= 0) {
    throw new ApiError(500, "INTERNAL_ERROR", "Invalid ranking configuration.");
  }
  const today = new Date(now).toISOString().slice(0, 10);
  const start = new Date(Date.parse(today) - (windowDays - 1) * 86400000).toISOString().slice(0, 10);
  // One SQL statement gives every ranking and displayed aggregate the same database snapshot.
  const result = await db.prepare(`SELECT c.article_id, c.publish_at_ms,
    COALESCE(s.reads, 0) AS reads, COALESCE(s.comments_count, 0) AS comments_count,
    COALESCE(s.rating_sum, 0) AS rating_sum, COALESCE(s.rating_count, 0) AS rating_count,
    COALESCE((SELECT SUM(d.reads) FROM article_read_daily d WHERE d.site_id = c.site_id
      AND d.article_id = c.article_id AND d.day_utc BETWEEN ? AND ?), 0) AS rolling_reads
    FROM content_articles c LEFT JOIN article_stats s
      ON s.site_id = c.site_id AND s.article_id = c.article_id
    WHERE c.site_id = ? AND c.runtime_enabled = 1 AND c.publish_at_ms <= ?`)
    .bind(start, today, siteId, now).all<Row>();
  if (!result.success) throw new ApiError(500, "INTERNAL_ERROR", "Stats are unavailable.");
  const rows = result.results ?? [];
  const count = rows.reduce((total, row) => total + row.rating_count, 0);
  const mean = count ? rows.reduce((total, row) => total + row.rating_sum, 0) / count : 0;
  const score = (row: Row) => row.rating_count ? (row.rating_sum + priorWeight * mean) / (row.rating_count + priorWeight) : -1;
  const tie = (a: Row, b: Row) => b.publish_at_ms - a.publish_at_ms || (a.article_id < b.article_id ? -1 : a.article_id > b.article_id ? 1 : 0);
  const rank = (compare: (a: Row, b: Row) => number) => [...rows].sort((a, b) => compare(a, b) || tie(a, b)).map((row) => row.article_id);
  return {
    generatedAt: new Date(now).toISOString(),
    articles: [...rows].sort(tie).map((row) => ({ id: row.article_id, reads: row.reads,
      commentsCount: row.comments_count, ratingValue: row.rating_count ? row.rating_sum / row.rating_count : null,
      ratingCount: row.rating_count })),
    rankings: {
      popularNow: rank((a, b) => b.rolling_reads - a.rolling_reads),
      popular: rank((a, b) => b.reads - a.reads),
      comments: rank((a, b) => b.comments_count - a.comments_count),
      rating: rank((a, b) => score(b) - score(a) || b.rating_count - a.rating_count),
    },
  };
}
