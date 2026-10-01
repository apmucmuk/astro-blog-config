import { readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
const launchEnabled = process.env.SEO_LAUNCH_ENABLED === "true";

async function readDist(relativePath) {
  return readFile(path.join(dist, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, expected, label) {
  assert(source.includes(expected), `${label}: expected to include ${expected}`);
}

function assertExcludes(source, expected, label) {
  assert(!source.includes(expected), `${label}: expected to exclude ${expected}`);
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function structuredData(source, label) {
  const scripts = [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  if (!scripts.length) throw new Error(`${label}: missing parseable JSON-LD.`);
  return scripts;
}

function assertDocumentMetadata(source, { label, canonical, indexable, h1 }) {
  assertIncludes(source, '<html lang="pl">', `${label} lang`);
  assert(count(source, /<title>/g) === 1, `${label}: title must be unique.`);
  assert(count(source, /<meta name="description"/g) === 1, `${label}: description must be unique.`);
  assert(count(source, /<meta name="robots"/g) === 1, `${label}: robots must be unique.`);
  assertIncludes(source, `meta name="robots" content="${indexable && launchEnabled ? "index,follow" : "noindex,follow"}"`, `${label} robots`);
  assert(count(source, /<link rel="canonical"/g) === 1, `${label}: canonical must be unique.`);
  assertIncludes(source, `rel="canonical" href="${canonical}"`, `${label} canonical`);
  for (const property of ["og:title", "og:description", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt"]) {
    assertIncludes(source, `property="${property}"`, `${label} ${property}`);
  }
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assertIncludes(source, `name="${name}"`, `${label} ${name}`);
  }
  assert(count(source, /<h1(?:\s|>)/g) === 1, `${label}: expected one H1 (${h1}).`);
}

const documents = [
  { path: "index.html", canonical: "https://tragarze.pl/", indexable: true, h1: "home" },
  { path: "blog/index.html", canonical: "https://tragarze.pl/blog/", indexable: true, h1: "blog" },
  { path: "blog/poradniki/index.html", canonical: "https://tragarze.pl/blog/poradniki/", indexable: true, h1: "category" },
  { path: "blog/poradniki/jak-przygotowac-przeprowadzke/index.html", canonical: "https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/", indexable: true, h1: "article" },
  { path: "redakcja/index.html", canonical: "https://tragarze.pl/redakcja/", indexable: true, h1: "editorial" },
  { path: "redakcja/jan-kowalski/index.html", canonical: "https://tragarze.pl/redakcja/jan-kowalski/", indexable: true, h1: "author" },
  { path: "uslugi/index.html", canonical: "https://tragarze.pl/uslugi/", indexable: true, h1: "services" },
  { path: "narzedzia/index.html", canonical: "https://tragarze.pl/narzedzia/", indexable: true, h1: "tools" },
  { path: "szukaj/index.html", canonical: "https://tragarze.pl/szukaj/", indexable: false, h1: "search" },
];

for (const document of documents) {
  assertDocumentMetadata(await readDist(document.path), { ...document, label: document.path });
}

const articlePath = "blog/poradniki/jak-przygotowac-przeprowadzke/index.html";
const article = await readDist(articlePath);
assertIncludes(article, "<title>Jak przygotować przeprowadzkę mieszkania</title>", articlePath);
assertIncludes(article, 'hreflang="pl"', articlePath);
assertIncludes(article, 'hreflang="x-default"', articlePath);
assertIncludes(article, 'property="og:image" content="https://tragarze.pl/images/sample-move.svg"', articlePath);
assertExcludes(article, "szkic-przeprowadzki", articlePath);
assertExcludes(article, "zaplanowana-przeprowadzka", articlePath);
const articleJsonLd = structuredData(article, articlePath);
assertIncludes(JSON.stringify(articleJsonLd), '"@type":"BlogPosting"', `${articlePath} JSON-LD`);
assertIncludes(JSON.stringify(articleJsonLd), '"@type":"BreadcrumbList"', `${articlePath} JSON-LD`);

const profilePath = "redakcja/jan-kowalski/index.html";
const profile = await readDist(profilePath);
assertIncludes(profile, '"@type":"ProfilePage"', profilePath);
assertIncludes(profile, '"@type":"Person"', profilePath);
assertIncludes(JSON.stringify(structuredData(profile, profilePath)), '"@type":"ProfilePage"', `${profilePath} JSON-LD`);

const notFound = await readDist("404.html");
assertIncludes(notFound, "<h1>Nie znaleziono strony</h1>", "404.html");
assertIncludes(notFound, 'meta name="robots" content="noindex,follow"', "404.html");
assertExcludes(notFound, 'rel="canonical"', "404.html");

const admin = await readDist("admin/index.html");
assertIncludes(admin, 'meta name="robots" content="noindex,follow"', "admin/index.html");
assertExcludes(admin, 'rel="canonical"', "admin/index.html");

const sitemap = await readDist("sitemap.xml");
if (launchEnabled) {
  assertIncludes(sitemap, "https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/", "sitemap.xml");
  assertIncludes(sitemap, "https://tragarze.pl/redakcja/jan-kowalski/", "sitemap.xml");
  assertIncludes(sitemap, "https://tragarze.pl/uslugi/", "sitemap.xml");
  assertIncludes(sitemap, "https://tragarze.pl/narzedzia/", "sitemap.xml");
} else {
  assert(!/<loc>/.test(sitemap), "Pre-launch sitemap must not advertise noindex URLs.");
}
assertExcludes(sitemap, "szkic-przeprowadzki", "sitemap.xml");
assertExcludes(sitemap, "zaplanowana-przeprowadzka", "sitemap.xml");
assertExcludes(sitemap, "404", "sitemap.xml");

const rss = await readDist("rss.xml");
assertIncludes(rss, "art-tragarze-001", "rss.xml");
assertExcludes(rss, "art-tragarze-draft", "rss.xml");
assertExcludes(rss, "art-tragarze-scheduled", "rss.xml");

const robots = await readDist("robots.txt");
assertIncludes(robots, "Allow: /", "robots.txt");
assertIncludes(robots, "Sitemap: https://tragarze.pl/sitemap.xml", "robots.txt");

const redirects = await readDist("redirects.json");
assertIncludes(redirects, '"/blog/poradniki/stary-plan-przeprowadzki/"', "redirects.json");
assertIncludes(redirects, '"/blog/poradniki/jak-przygotowac-przeprowadzke/"', "redirects.json");

console.log(`SEO build validation passed (${launchEnabled ? "launch" : "pre-launch"} mode).`);
