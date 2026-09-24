import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const expectedEnvironment = process.argv[2] ?? "production";
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = await readFile(path.join(dist, "_headers"), "utf8");
const redirects = await readFile(path.join(dist, "_redirects"), "utf8");
const manifest = JSON.parse(await readFile(path.join(dist, "deployment-manifest.json"), "utf8"));
const registrySql = await readFile(path.join(process.cwd(), "worker/registry/content-articles.sql"), "utf8");
const productionApiOrigin = "https://api.tragarze.pl";

for (const expected of ["X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin", "Permissions-Policy:", "Content-Security-Policy:", "/_astro/*", "immutable", "/pagefind/*"]) {
  assert(text.includes(expected), `Missing deploy header rule: ${expected}`);
}
assert(redirects.includes("/blog/page/1/ /blog/ 301"), "Missing /page/1/ normalization redirect.");
assert(redirects.includes("/blog/poradniki/stary-plan-przeprowadzki/ /blog/poradniki/jak-przygotowac-przeprowadzke/ 301"), "Missing historical redirect.");
assert(!/\bBEGIN(?:\s+TRANSACTION)?\s*;/i.test(registrySql), "Registry sync SQL must not contain an explicit transaction wrapper.");
assert(!/\bCOMMIT\s*;/i.test(registrySql), "Registry sync SQL must not contain an explicit transaction wrapper.");
assert(!/\bSAVEPOINT\b/i.test(registrySql), "Registry sync SQL must not contain savepoints.");
assert(registrySql.includes("ON CONFLICT(site_id, article_id) DO UPDATE") && registrySql.includes("runtime_enabled = 0"), "Registry sync must upsert current entries and disable removed entries.");
assert(!registrySql.includes("art-tragarze-draft") && !registrySql.includes("art-tragarze-scheduled"), "Registry SQL must exclude draft/scheduled entries.");
assert(manifest.environment === expectedEnvironment, `Expected ${expectedEnvironment} deployment artifacts.`);
const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
if (expectedEnvironment === "preview") {
  assert(text.includes("X-Robots-Tag: noindex, nofollow"), "Preview must set a noindex response header.");
  assert(robots.includes("Disallow: /"), "Preview robots.txt must disallow crawling.");
  assert(typeof manifest.apiOrigin === "string" && manifest.apiOrigin.startsWith("https://"), "Preview manifest must record an HTTPS API origin.");
  assert(manifest.apiOrigin !== productionApiOrigin, "Preview must not use the production API origin.");
  const files = await readdir(dist, { recursive: true });
  const textFiles = await Promise.all(files.filter((file) => /\.(?:html|js|json|txt)$/i.test(file)).map((file) => readFile(path.join(dist, file), "utf8")));
  assert(!textFiles.some((file) => file.includes(productionApiOrigin)), "Preview dist must not contain the production API origin.");
  const adminHtml = await readFile(path.join(dist, "admin/index.html"), "utf8");
  const articleHtml = await readFile(path.join(dist, "blog/poradniki/jak-przygotowac-przeprowadzke/index.html"), "utf8");
  const adminScript = await readFile(path.join(dist, "scripts/admin-moderation.js"), "utf8");
  const routes = JSON.parse(await readFile(path.join(dist, "_routes.json"), "utf8"));
  assert(!adminHtml.includes("data-api-url="), "Admin HTML must use same-origin /admin/api routes, not PUBLIC_API_URL.");
  assert(!adminHtml.includes(manifest.apiOrigin), "Admin HTML must not contain the preview Worker origin.");
  assert(!adminScript.includes("workers.dev") && !adminScript.includes(manifest.apiOrigin), "Admin client must not call a Worker origin directly.");
  assert(adminScript.includes('"/admin/api/comments/spam/purge"') && adminScript.includes("`/admin/api/comments?status="), "Admin client must use relative /admin/api routes.");
  assert(JSON.stringify(routes) === JSON.stringify({ version: 1, include: ["/admin/api/*"], exclude: [] }), "Pages Functions must be limited to /admin/api/*.");
  assert(articleHtml.includes(`data-api-url=\"${manifest.apiOrigin}\"`), "Interactive public pages must keep the configured preview API origin.");
} else {
  assert(text.includes("Strict-Transport-Security:"), "Production must declare HSTS after HTTPS deployment verification.");
  assert(robots.includes("Sitemap:"), "Production robots.txt must retain the sitemap.");
}

const redirectMap = new Map(redirects.trim().split("\n").map((line) => {
  const [source, target, status] = line.split(/\s+/);
  return [source, { target, status: Number(status) }];
}));
function headerFor(url) {
  if (url.startsWith("/_astro/")) return "public, max-age=31536000, immutable";
  if (url.startsWith("/pagefind/") || url.startsWith("/scripts/")) return "public, max-age=3600";
  return "public, max-age=0, must-revalidate";
}
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost").pathname;
  const redirect = redirectMap.get(url);
  if (redirect) {
    response.writeHead(redirect.status, { Location: redirect.target, "Cache-Control": "public, max-age=0, must-revalidate" });
    response.end();
    return;
  }
  const requestPath = url.replace(/^\//, "");
  const relative = url === "/" ? "index.html" : path.extname(requestPath) ? requestPath : `${requestPath.replace(/\/$/, "")}/index.html`;
  const candidate = path.join(dist, relative);
  try {
    const info = await stat(candidate);
    if (!info.isFile()) throw new Error("not a file");
    response.writeHead(200, { "Cache-Control": headerFor(url), "Content-Type": candidate.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
    response.end(await readFile(candidate));
  } catch {
    response.writeHead(404, { "Cache-Control": "public, max-age=0, must-revalidate", "Content-Type": "text/html; charset=utf-8" });
    response.end(await readFile(path.join(dist, "404.html")));
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
try {
  const canonical = await fetch(`${origin}/blog/poradniki/jak-przygotowac-przeprowadzke/`);
  assert(canonical.status === 200, "Canonical article must return 200.");
  const old = await fetch(`${origin}/blog/poradniki/stary-plan-przeprowadzki/`, { redirect: "manual" });
  assert(old.status === 301 && old.headers.get("location") === "/blog/poradniki/jak-przygotowac-przeprowadzke/", "Historical redirect must return 301 + Location.");
  const pageOne = await fetch(`${origin}/blog/page/1/`, { redirect: "manual" });
  assert(pageOne.status === 301 && pageOne.headers.get("location") === "/blog/", "/page/1/ must normalize with 301.");
  const unknown = await fetch(`${origin}/not-found/`);
  assert(unknown.status === 404 && (await unknown.text()).includes("Nie znaleziono strony"), "Unknown URL must return project 404.");
  const assetName = (await readdir(path.join(dist, "_astro"))).find((file) => file.endsWith(".js"));
  assert(assetName, "Production build did not emit a fingerprinted JavaScript asset.");
  const asset = await fetch(`${origin}/_astro/${assetName}`);
  assert(asset.headers.get("cache-control") === "public, max-age=31536000, immutable", "Hashed asset cache contract is missing.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log("Deploy adapter local HTTP validation passed.");
