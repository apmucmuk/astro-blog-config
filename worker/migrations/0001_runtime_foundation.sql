-- Stage 5 Worker + D1 foundation.
-- Canonical physical model follows SPEC section 85.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS content_articles (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  publish_at_ms INTEGER NOT NULL,
  runtime_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id),

  CHECK (runtime_enabled IN (0, 1))
);

CREATE TABLE IF NOT EXISTS article_stats (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,

  reads INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,

  rating_sum INTEGER NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,

  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id),

  CHECK (reads >= 0),
  CHECK (comments_count >= 0),
  CHECK (rating_sum >= 0),
  CHECK (rating_count >= 0)
);

CREATE TABLE IF NOT EXISTS article_read_daily (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  day_utc TEXT NOT NULL,
  reads INTEGER NOT NULL DEFAULT 0,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id, day_utc),

  CHECK (reads >= 0),
  CHECK (length(day_utc) = 10)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,

  parent_id TEXT,

  author_name TEXT NOT NULL,
  body TEXT NOT NULL,

  status TEXT NOT NULL,
  moderation_reason TEXT,

  reports_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,

  link_rel TEXT,

  created_at_ms INTEGER NOT NULL,

  PRIMARY KEY (id),

  CHECK (length(author_name) BETWEEN 1 AND 40),
  CHECK (length(body) BETWEEN 1 AND 1500),
  CHECK (status IN ('published', 'pending', 'spam')),
  CHECK (
    link_rel IS NULL
    OR link_rel IN ('dofollow', 'nofollow', 'sponsored')
  ),
  CHECK (reports_count >= 0),
  CHECK (helpful_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_comments_public_keyset
ON comments (
  site_id,
  article_id,
  status,
  created_at_ms DESC,
  id DESC
);

CREATE INDEX IF NOT EXISTS idx_comments_featured
ON comments (
  site_id,
  article_id,
  status,
  helpful_count DESC,
  created_at_ms DESC
);

CREATE INDEX IF NOT EXISTS idx_comments_moderation
ON comments (
  status,
  reports_count,
  created_at_ms DESC
);

CREATE TABLE IF NOT EXISTS article_rating_votes (
  site_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,

  value INTEGER NOT NULL,

  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,

  PRIMARY KEY (site_id, article_id, visitor_id),

  CHECK (value >= 1 AND value <= 5)
);
