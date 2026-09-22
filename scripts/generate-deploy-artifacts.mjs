import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const headers = [
  "/*",
  "  Cache-Control: public, max-age=0, must-revalidate",
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  Permissions-Policy: camera=(), geolocation=(), microphone=()",
  `  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; frame-src https://challenges.cloudflare.com; connect-src 'self' ${apiOrigin} https://challenges.cloudflare.com`,
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
  staticOutput: "dist",
  registryGeneratedAtMs: registry.generatedAtMs,
  runtimeArticleCount: registry.articles.length,
  redirectCount: redirects.redirects.length,
}, null, 2)}\n`);

console.log(`Deployment artifacts generated for ${environment}.`);
