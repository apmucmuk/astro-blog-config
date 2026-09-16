import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const siteId = process.env.SITE_ID ?? "tragarze-pl";
const contentDir = path.join(root, "src/content/blog");
const outputPath = path.join(root, "worker/registry/content-articles.json");

async function listMdxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listMdxFiles(absolutePath);
      }

      return entry.isFile() && entry.name.endsWith(".mdx") ? [absolutePath] : [];
    }),
  );

  return files.flat();
}

function isProductionPublic(data, now) {
  if (data.draft === true) {
    return false;
  }

  const publishDate = new Date(data.publishDate);
  if (Number.isNaN(publishDate.valueOf())) {
    throw new Error(`Invalid publishDate for article ${data.id ?? "(missing id)"}`);
  }

  return publishDate.valueOf() <= now;
}

const now = Date.now();
const files = await listMdxFiles(contentDir);
const articles = [];
let latestPublishAtMs = 0;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const { data } = matter(source);
  if (!data.id || !data.publishDate) {
    throw new Error(`Article ${path.relative(root, file)} is missing id or publishDate.`);
  }

  const publishAtMs = new Date(data.publishDate).valueOf();
  const runtimeEnabled = isProductionPublic(data, now);
  if (!runtimeEnabled) {
    continue;
  }

  latestPublishAtMs = Math.max(latestPublishAtMs, publishAtMs);
  articles.push({
    siteId,
    articleId: data.id,
    publishAtMs,
    runtimeEnabled: true,
  });
}

const updatedAtMs = Number.parseInt(process.env.REGISTRY_UPDATED_AT_MS ?? `${latestPublishAtMs}`, 10);
if (!Number.isSafeInteger(updatedAtMs) || updatedAtMs < 0) {
  throw new Error("REGISTRY_UPDATED_AT_MS must be a non-negative integer when provided.");
}

const registryArticles = articles
  .map((article) => ({ ...article, updatedAtMs }))
  .sort((left, right) => left.siteId.localeCompare(right.siteId) || left.articleId.localeCompare(right.articleId));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ generatedAtMs: updatedAtMs, articles: registryArticles }, null, 2)}\n`);

console.log(`Runtime registry generated: ${registryArticles.length} article(s).`);
