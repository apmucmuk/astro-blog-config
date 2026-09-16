-- Stage 6 rating aggregate consistency.
-- Keep article_stats.rating_sum/rating_count synchronized with article_rating_votes
-- at the D1 layer so concurrent Worker requests cannot apply stale deltas.

CREATE TRIGGER IF NOT EXISTS trg_article_rating_votes_after_insert
AFTER INSERT ON article_rating_votes
BEGIN
  UPDATE article_stats
  SET
    rating_sum = rating_sum + NEW.value,
    rating_count = rating_count + 1,
    updated_at_ms = NEW.updated_at_ms
  WHERE site_id = NEW.site_id
    AND article_id = NEW.article_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_article_rating_votes_after_value_update
AFTER UPDATE OF value ON article_rating_votes
WHEN OLD.value <> NEW.value
BEGIN
  UPDATE article_stats
  SET
    rating_sum = rating_sum - OLD.value + NEW.value,
    updated_at_ms = NEW.updated_at_ms
  WHERE site_id = NEW.site_id
    AND article_id = NEW.article_id;
END;
