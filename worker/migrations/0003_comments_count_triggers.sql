-- Stage 7 comments aggregate consistency.
-- Keep article_stats.comments_count synchronized with the comments table
-- inside D1 so repeated/concurrent moderation mutations cannot apply stale deltas.

CREATE TRIGGER IF NOT EXISTS trg_comments_after_insert_published
AFTER INSERT ON comments
WHEN NEW.status = 'published'
BEGIN
  UPDATE article_stats
  SET
    comments_count = comments_count + 1,
    updated_at_ms = NEW.created_at_ms
  WHERE site_id = NEW.site_id
    AND article_id = NEW.article_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_comments_after_status_update
AFTER UPDATE OF status ON comments
WHEN OLD.status <> NEW.status
BEGIN
  UPDATE article_stats
  SET
    comments_count = comments_count
      + CASE WHEN NEW.status = 'published' THEN 1 ELSE 0 END
      - CASE WHEN OLD.status = 'published' THEN 1 ELSE 0 END,
    updated_at_ms = NEW.created_at_ms
  WHERE site_id = NEW.site_id
    AND article_id = NEW.article_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_comments_after_delete_published
AFTER DELETE ON comments
WHEN OLD.status = 'published'
BEGIN
  UPDATE article_stats
  SET
    comments_count = comments_count - 1,
    updated_at_ms = OLD.created_at_ms
  WHERE site_id = OLD.site_id
    AND article_id = OLD.article_id;
END;
