import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "worker/registry/content-articles.json");
const outputPath = path.join(root, "worker/registry/content-articles.sql");
const registry = JSON.parse(await readFile(registryPath, "utf8"));

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = registry.articles;
const sites = [...new Set([...(registry.siteIds ?? []), ...rows.map((row) => row.siteId)])];
const statements = [];
for (const row of rows) {
  statements.push(
    `INSERT INTO content_articles (site_id, article_id, publish_at_ms, runtime_enabled, updated_at_ms) VALUES (${quote(row.siteId)}, ${quote(row.articleId)}, ${Number(row.publishAtMs)}, 1, ${Number(row.updatedAtMs)}) ON CONFLICT(site_id, article_id) DO UPDATE SET publish_at_ms = excluded.publish_at_ms, runtime_enabled = 1, updated_at_ms = excluded.updated_at_ms;`,
  );
}
for (const siteId of sites) {
  const ids = rows.filter((row) => row.siteId === siteId).map((row) => quote(row.articleId));
  const currentRows = ids.length ? ` AND article_id NOT IN (${ids.join(", ")})` : "";
  statements.push(`UPDATE content_articles SET runtime_enabled = 0, updated_at_ms = ${Number(registry.generatedAtMs)} WHERE site_id = ${quote(siteId)}${currentRows};`);
}
await writeFile(outputPath, `${statements.join("\n")}\n`);
console.log(`Runtime registry SQL generated for ${rows.length} article(s).`);
