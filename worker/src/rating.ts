import {
  ApiError,
  assertStrictObject,
  requireIntegerInRange,
  type ArticleStats,
  type RatingRequest,
  type RatingResponse,
} from "../../src/core/api";
import { ensureArticleStats } from "./d1";
import type { D1Database } from "./types";

type RatingVoteRow = {
  value: number;
};

const ratingRequestSchema = {
  keys: ["value"],
  parse(value: Record<string, unknown>): RatingRequest | { field: string; message: string }[] {
    const rating = requireIntegerInRange(value.value, "value", 1, 5);
    return typeof rating === "number" ? { value: rating } : [rating];
  },
} as const;

export function parseRatingRequest(value: unknown): RatingRequest {
  return assertStrictObject(value, ratingRequestSchema);
}

export function toRatingResponse(stats: ArticleStats, myRating: number | null): RatingResponse {
  return {
    ratingValue: stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null,
    ratingCount: stats.ratingCount,
    myRating,
  };
}

export async function getRating(
  db: D1Database,
  siteId: string,
  articleId: string,
  visitorId: string | null,
): Promise<RatingResponse> {
  const stats = await ensureArticleStats(db, siteId, articleId);
  const vote = visitorId
    ? await db
        .prepare(
          `SELECT value
           FROM article_rating_votes
           WHERE site_id = ? AND article_id = ? AND visitor_id = ?`,
        )
        .bind(siteId, articleId, visitorId)
        .first<RatingVoteRow>()
    : null;

  return toRatingResponse(stats, vote?.value ?? null);
}

export async function submitRating(
  db: D1Database,
  siteId: string,
  articleId: string,
  visitorId: string,
  value: number,
  nowMs = Date.now(),
): Promise<RatingResponse> {
  const stats = await ensureArticleStats(db, siteId, articleId, nowMs);
  const existing = await db
    .prepare(
      `SELECT value
       FROM article_rating_votes
       WHERE site_id = ? AND article_id = ? AND visitor_id = ?`,
    )
    .bind(siteId, articleId, visitorId)
    .first<RatingVoteRow>();

  if (existing?.value === value) {
    return toRatingResponse(stats, value);
  }

  if (!db.batch) {
    throw new ApiError(500, "INTERNAL_ERROR", "Atomic D1 batch is required for rating mutations.");
  }

  const statements = existing
    ? [
        db
          .prepare(
            `UPDATE article_rating_votes
             SET value = ?, updated_at_ms = ?
             WHERE site_id = ? AND article_id = ? AND visitor_id = ?`,
          )
          .bind(value, nowMs, siteId, articleId, visitorId),
        db
          .prepare(
            `UPDATE article_stats
             SET rating_sum = rating_sum - ? + ?, updated_at_ms = ?
             WHERE site_id = ? AND article_id = ?`,
          )
          .bind(existing.value, value, nowMs, siteId, articleId),
      ]
    : [
        db
          .prepare(
            `INSERT INTO article_rating_votes (
              site_id,
              article_id,
              visitor_id,
              value,
              created_at_ms,
              updated_at_ms
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(siteId, articleId, visitorId, value, nowMs, nowMs),
        db
          .prepare(
            `UPDATE article_stats
             SET rating_sum = rating_sum + ?, rating_count = rating_count + 1, updated_at_ms = ?
             WHERE site_id = ? AND article_id = ?`,
          )
          .bind(value, nowMs, siteId, articleId),
      ];

  const results = await db.batch(statements);
  if (results.some((result) => !result.success)) {
    throw new ApiError(500, "INTERNAL_ERROR", "Rating mutation failed.");
  }

  const updatedStats = await ensureArticleStats(db, siteId, articleId, nowMs);
  return toRatingResponse(updatedStats, value);
}
