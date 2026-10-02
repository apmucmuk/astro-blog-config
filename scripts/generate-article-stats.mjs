import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const exec = promisify(execFile);
const environment = process.argv[2];
if (!['preview', 'production'].includes(environment)) throw new Error('Usage: node scripts/generate-article-stats.mjs <preview|production>');
const root = process.cwd();
const config = path.join(root, 'worker', `wrangler.${environment}.jsonc`);
const sql = "SELECT article_id AS articleId, rating_sum AS ratingSum, rating_count AS ratingCount FROM article_stats WHERE site_id = 'tragarze-pl' ORDER BY article_id ASC";
const { stdout } = await exec(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'd1', 'execute', 'DB', '--config', config, '--remote', '--command', sql, '--json'], { cwd: root, maxBuffer: 5 * 1024 * 1024 });
const payload = JSON.parse(stdout);
const rows = Array.isArray(payload) ? payload.flatMap((entry) => entry.results ?? []) : payload.results ?? [];
const stats = Object.fromEntries(rows.map((row) => [row.articleId, { ratingValue: row.ratingCount > 0 ? row.ratingSum / row.ratingCount : null, ratingCount: row.ratingCount }]));
const target = path.join(root, 'worker/registry/article-stats.json');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Article stats snapshot generated for ${Object.keys(stats).length} article(s).`);
