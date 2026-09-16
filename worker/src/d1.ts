import { ApiError, type ArticleStats, type RuntimeArticle } from "../../src/core/api";
import type { D1Database } from "./types";

type ContentArticleRow = {
  site_id: string;
  article_id: string;
  publish_at_ms: number;
  runtime_enabled: number;
  updated_at_ms: number;
};

type ArticleStatsRow = {
  site_id: string;
  article_id: string;
  reads: number;
  comments_count: number;
  rating_sum: number;
  rating_count: number;
  updated_at_ms: number;
};

export function mapContentArticle(row: ContentArticleRow): RuntimeArticle {
  return {
    siteId: row.site_id,
    articleId: row.article_id,
    publishAtMs: row.publish_at_ms,
    runtimeEnabled: row.runtime_enabled === 1,
    updatedAtMs: row.updated_at_ms,
  };
}

export function mapArticleStats(row: ArticleStatsRow): ArticleStats {
  return {
    siteId: row.site_id,
    articleId: row.article_id,
    reads: row.reads,
    commentsCount: row.comments_count,
    ratingSum: row.rating_sum,
    ratingCount: row.rating_count,
    updatedAtMs: row.updated_at_ms,
  };
}

export async function getRuntimeArticle(
  db: D1Database,
  siteId: string,
  articleId: string,
): Promise<RuntimeArticle | null> {
  const row = await db
    .prepare(
      `SELECT site_id, article_id, publish_at_ms, runtime_enabled, updated_at_ms
       FROM content_articles
       WHERE site_id = ? AND article_id = ?`,
    )
    .bind(siteId, articleId)
    .first<ContentArticleRow>();

  return row ? mapContentArticle(row) : null;
}

export async function assertRuntimeArticleEnabled(
  db: D1Database,
  siteId: string,
  articleId: string,
): Promise<RuntimeArticle> {
  const article = await getRuntimeArticle(db, siteId, articleId);
  if (!article || !article.runtimeEnabled) {
    throw new ApiError(404, "NOT_FOUND", "Article is not available for runtime operations.");
  }

  return article;
}

export async function ensureArticleStats(
  db: D1Database,
  siteId: string,
  articleId: string,
  nowMs = Date.now(),
): Promise<ArticleStats> {
  await assertRuntimeArticleEnabled(db, siteId, articleId);

  await db
    .prepare(
      `INSERT INTO article_stats (
        site_id,
        article_id,
        reads,
        comments_count,
        rating_sum,
        rating_count,
        updated_at_ms
      )
      VALUES (?, ?, 0, 0, 0, 0, ?)
      ON CONFLICT(site_id, article_id) DO NOTHING`,
    )
    .bind(siteId, articleId, nowMs)
    .run();

  const row = await db
    .prepare(
      `SELECT site_id, article_id, reads, comments_count, rating_sum, rating_count, updated_at_ms
       FROM article_stats
       WHERE site_id = ? AND article_id = ?`,
    )
    .bind(siteId, articleId)
    .first<ArticleStatsRow>();

  if (!row) {
    throw new ApiError(500, "INTERNAL_ERROR", "Unable to initialize article stats.");
  }

  return mapArticleStats(row);
}
