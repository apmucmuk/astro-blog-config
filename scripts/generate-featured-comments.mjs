import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const exec = promisify(execFile);
const environment = process.argv[2];
if (!['preview', 'production'].includes(environment)) throw new Error('Usage: node scripts/generate-featured-comments.mjs <preview|production>');
const root = process.cwd();
const config = path.join(root, 'worker', `wrangler.${environment}.jsonc`);
const sql = "SELECT article_id AS articleId, id, author_name AS name, body, created_at_ms AS createdAtMs, helpful_count AS helpfulCount, link_rel AS linkRel FROM comments WHERE site_id = 'tragarze-pl' AND status = 'published' ORDER BY article_id ASC, helpful_count DESC, created_at_ms DESC, id DESC";
const { stdout } = await exec(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'd1', 'execute', 'DB', '--config', config, '--remote', '--command', sql, '--json'], { cwd: root, maxBuffer: 5 * 1024 * 1024 });
const payload = JSON.parse(stdout);
const rows = Array.isArray(payload) ? payload.flatMap((entry) => entry.results ?? []) : payload.results ?? [];
const featured = {};
for (const row of rows) {
  const bucket = featured[row.articleId] ?? (featured[row.articleId] = []);
  if (bucket.length < 5) bucket.push({ id: row.id, parentId: null, name: row.name, body: row.body, createdAt: new Date(row.createdAtMs).toISOString(), helpfulCount: row.helpfulCount, linkRel: row.linkRel });
}
const target = path.join(root, 'worker/registry/featured-comments.json');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(featured, null, 2)}\n`);
console.log(`Featured comments snapshot generated for ${Object.keys(featured).length} article(s).`);
