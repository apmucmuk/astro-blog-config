import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const environment = process.env.DEPLOY_ENV ?? "production";
if (!["preview", "production"].includes(environment)) {
  throw new Error("DEPLOY_ENV must be preview or production.");
}

const redirects = JSON.parse(await readFile(path.join(dist, "redirects.json"), "utf8"));
if (!Array.isArray(redirects.redirects) || !redirects.redirects.every((entry) => entry.status === 301)) {
  throw new Error("The generated redirect manifest must contain only explicit 301 redirects.");
}

const redirectLines = [
  ...redirects.redirects.map((entry) => `${entry.source} ${entry.destination} 301`),
  "/blog/page/1/ /blog/ 301",
  "/blog/:category/page/1/ /blog/:category/ 301",
  "/redakcja/:person/page/1/ /redakcja/:person/ 301",
];
await writeFile(path.join(dist, "_redirects"), `${redirectLines.join("\n")}\n`);

const apiOrigin = process.env.PUBLIC_API_URL ?? "https://api.tragarze.pl";
if (environment === "preview" && apiOrigin === "https://api.tragarze.pl") {
  throw new Error("Preview deployment artifacts must use a non-production PUBLIC_API_URL.");
}
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : (entry.name.endsWith(".html") ? [target] : []);
  }));
  return nested.flat();
}

const builtHtml = await htmlFiles(dist);
const bootstrapBodies = new Set();
for (const file of builtHtml) {
  const source = await readFile(file, "utf8");
  const scripts = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((script) => !script[1].includes("src=") && !script[1].includes('type="application/ld+json"') && script[2]);
  if (scripts.length !== 1) throw new Error(`Expected one executable inline theme bootstrap in ${path.relative(dist, file)}.`);
  bootstrapBodies.add(scripts[0][2]);
}
if (bootstrapBodies.size !== 1) throw new Error("The inline theme bootstrap must have identical bytes across static HTML output.");
const themeBootstrapHash = createHash("sha256").update([...bootstrapBodies][0], "utf8").digest("base64");
const headers = [
  "/*",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  Permissions-Policy: camera=(), geolocation=(), microphone=()",
  `  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'sha256-${themeBootstrapHash}' 'wasm-unsafe-eval' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; frame-src https://challenges.cloudflare.com; connect-src 'self' ${apiOrigin} https://challenges.cloudflare.com`,
  ...(environment === "production" ? ["  Strict-Transport-Security: max-age=31536000; includeSubDomains"] : ["  X-Robots-Tag: noindex, nofollow"]),
  "",
  "/_astro/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "",
  "/pagefind/*",
  "  Cache-Control: public, max-age=3600",
  "",
  "/images/*",
  "  Cache-Control: public, max-age=86400",
  "",
  "/scripts/*",
  "  Cache-Control: public, max-age=3600",
];
await writeFile(path.join(dist, "_headers"), `${headers.join("\n")}\n`);

if (environment === "preview") {
  await writeFile(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
}

const registry = JSON.parse(await readFile(path.join(root, "worker/registry/content-articles.json"), "utf8"));
await mkdir(path.join(dist, ".well-known"), { recursive: true });
await writeFile(path.join(dist, "deployment-manifest.json"), `${JSON.stringify({
  environment,
  apiOrigin,
  staticOutput: "dist",
  registryGeneratedAtMs: registry.generatedAtMs,
  runtimeArticleCount: registry.articles.length,
  redirectCount: redirects.redirects.length,
}, null, 2)}\n`);

console.log(`Deployment artifacts generated for ${environment}.`);
