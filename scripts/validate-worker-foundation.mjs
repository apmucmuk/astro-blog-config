import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const migrationDir = path.join(root, "worker/migrations");
const migrations = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
assert(migrations.includes("0001_runtime_foundation.sql"), "Stage 5 baseline migration is missing.");
assert(migrations.includes("0002_rating_aggregate_triggers.sql"), "Stage 6 rating aggregate trigger migration is missing.");
assert(migrations.includes("0003_comments_count_triggers.sql"), "Stage 7 comments_count trigger migration is missing.");

const migration = await read("worker/migrations/0001_runtime_foundation.sql");
const ratingMigration = await read("worker/migrations/0002_rating_aggregate_triggers.sql");
const commentsMigration = await read("worker/migrations/0003_comments_count_triggers.sql");
const requiredTables = [
  "content_articles",
  "article_stats",
  "article_read_daily",
  "comments",
  "article_rating_votes",
];
const requiredIndexes = [
  "idx_comments_public_keyset",
  "idx_comments_featured",
  "idx_comments_moderation",
];

for (const table of requiredTables) {
  assert(migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `Missing canonical D1 table: ${table}`);
}

for (const index of requiredIndexes) {
  assert(migration.includes(`CREATE INDEX IF NOT EXISTS ${index}`), `Missing canonical D1 index: ${index}`);
}

assert(migration.includes("PRIMARY KEY (site_id, article_id)"), "content/article aggregate primary keys are missing.");
assert(migration.includes("ON comments"), "comments indexes must target comments table.");
assert(migration.includes("CHECK (runtime_enabled IN (0, 1))"), "content_articles runtime_enabled check is missing.");
assert(migration.includes("CHECK (value >= 1 AND value <= 5)"), "rating vote value check is missing.");
assert(
  ratingMigration.includes("trg_article_rating_votes_after_insert") &&
    ratingMigration.includes("rating_sum = rating_sum + NEW.value") &&
    ratingMigration.includes("rating_count = rating_count + 1"),
  "rating insert trigger must maintain rating_sum/rating_count.",
);
assert(
  ratingMigration.includes("trg_article_rating_votes_after_value_update") &&
    ratingMigration.includes("rating_sum = rating_sum - OLD.value + NEW.value"),
  "rating update trigger must maintain rating_sum from OLD/NEW values.",
);
assert(
  commentsMigration.includes("trg_comments_after_insert_published") &&
    commentsMigration.includes("comments_count = comments_count + 1"),
  "comments insert trigger must increment comments_count for published rows.",
);
assert(
  commentsMigration.includes("trg_comments_after_status_update") &&
    commentsMigration.includes("OLD.status") &&
    commentsMigration.includes("NEW.status"),
  "comments status trigger must use OLD/NEW status transitions.",
);
assert(
  commentsMigration.includes("trg_comments_after_delete_published") &&
    commentsMigration.includes("comments_count = comments_count - 1"),
  "comments delete trigger must decrement comments_count for published rows.",
);

const wrangler = await read("worker/wrangler.jsonc");
assert(wrangler.includes('"binding": "DB"'), "Wrangler D1 binding DB is missing.");
assert(wrangler.includes('"preview_database_id"'), "Wrangler preview D1 database separation is missing.");
assert(wrangler.includes('"SITE_ID": "tragarze-pl"'), "Worker SITE_ID var is missing.");
assert(wrangler.includes('"ALLOWED_ORIGIN": "https://tragarze.pl"'), "Worker ALLOWED_ORIGIN var is missing.");

const registry = JSON.parse(await read("worker/registry/content-articles.json"));
assert(Array.isArray(registry.articles), "Runtime registry articles array is missing.");
assert(Array.isArray(registry.siteIds) && registry.siteIds.includes("tragarze-pl"), "Runtime registry site identity is missing.");
assert(registry.articles.some((article) => article.articleId === "art-tragarze-001"), "Published article registry row is missing.");
assert(
  !registry.articles.some((article) => article.articleId === "art-tragarze-draft" || article.articleId === "art-tragarze-scheduled"),
  "Draft or scheduled articles must not be runtime-enabled registry rows.",
);

const filesToScan = [
  ".env.example",
  "worker/wrangler.jsonc",
  "worker/src/index.ts",
  "worker/src/types.ts",
  "worker/src/responses.ts",
  "worker/src/d1.ts",
];
const secretValuePattern = /(CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_D1_DATABASE_ID|TURNSTILE_SECRET_KEY|CF_ACCESS_AUD)"?\s*[:=]\s*["'][^"']{8,}/;
for (const file of filesToScan) {
  const source = await read(file);
  assert(!secretValuePattern.test(source), `Potential committed secret value found in ${file}.`);
}

console.log("Worker foundation validation passed.");
