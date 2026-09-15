import { readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");

async function readDist(relativePath) {
  return readFile(path.join(dist, relativePath), "utf8");
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label}: expected to include ${expected}`);
  }
}

function assertExcludes(source, expected, label) {
  if (source.includes(expected)) {
    throw new Error(`${label}: expected to exclude ${expected}`);
  }
}

const articlePath = "blog/poradniki/jak-przygotowac-przeprowadzke/index.html";
const article = await readDist(articlePath);
assertIncludes(article, "<title>Jak przygotować przeprowadzkę mieszkania</title>", articlePath);
assertIncludes(article, 'rel="canonical" href="https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/"', articlePath);
assertIncludes(article, 'hreflang="pl"', articlePath);
assertIncludes(article, 'hreflang="x-default"', articlePath);
assertIncludes(article, '"@type":"BlogPosting"', articlePath);
assertIncludes(article, '"@type":"BreadcrumbList"', articlePath);
assertIncludes(article, 'meta name="robots" content="index,follow"', articlePath);
assertExcludes(article, "szkic-przeprowadzki", articlePath);
assertExcludes(article, "zaplanowana-przeprowadzka", articlePath);

const profilePath = "redakcja/jan-kowalski/index.html";
const profile = await readDist(profilePath);
assertIncludes(profile, "<title>Jan Kowalski - redakcja tragarze.pl</title>", profilePath);
assertIncludes(profile, 'rel="canonical" href="https://tragarze.pl/redakcja/jan-kowalski/"', profilePath);
assertIncludes(profile, '"@type":"ProfilePage"', profilePath);
assertIncludes(profile, '"@type":"Person"', profilePath);

const editorial = await readDist("redakcja/index.html");
assertIncludes(editorial, "<title>Redakcja tragarze.pl</title>", "redakcja/index.html");
assertIncludes(editorial, '"@type":"BreadcrumbList"', "redakcja/index.html");

const notFound = await readDist("404.html");
assertIncludes(notFound, "<h1>Nie znaleziono strony</h1>", "404.html");
assertIncludes(notFound, 'meta name="robots" content="noindex,follow"', "404.html");
assertExcludes(notFound, 'rel="canonical"', "404.html");

const sitemap = await readDist("sitemap.xml");
assertIncludes(sitemap, "https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/", "sitemap.xml");
assertIncludes(sitemap, "https://tragarze.pl/redakcja/jan-kowalski/", "sitemap.xml");
assertExcludes(sitemap, "szkic-przeprowadzki", "sitemap.xml");
assertExcludes(sitemap, "zaplanowana-przeprowadzka", "sitemap.xml");
assertExcludes(sitemap, "404", "sitemap.xml");

const rss = await readDist("rss.xml");
assertIncludes(rss, "art-tragarze-001", "rss.xml");
assertExcludes(rss, "art-tragarze-draft", "rss.xml");
assertExcludes(rss, "art-tragarze-scheduled", "rss.xml");

const robots = await readDist("robots.txt");
assertIncludes(robots, "Sitemap: https://tragarze.pl/sitemap.xml", "robots.txt");

const redirects = await readDist("redirects.json");
assertIncludes(redirects, '"/blog/poradniki/stary-plan-przeprowadzki/"', "redirects.json");
assertIncludes(redirects, '"/blog/poradniki/jak-przygotowac-przeprowadzke/"', "redirects.json");

console.log("SEO build validation passed.");
