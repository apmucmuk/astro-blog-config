import { readFile } from "node:fs/promises";
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

const globalCss = await read("src/theme/styles/global.css");
const tokensCss = await read("src/theme/styles/tokens.css");
const articleSource = await read("src/pages/blog/[category]/[slug].astro");
const articleHtml = await read("dist/blog/poradniki/jak-przygotowac-przeprowadzke/index.html");

assert(tokensCss.includes(':root[data-theme="dark"]'), "tokens must support an explicit dark preference.");
assert(tokensCss.includes("@media (prefers-color-scheme: dark)"), "system preference must remain the no-JS fallback.");
assert(tokensCss.includes("--color-input") && tokensCss.includes("--color-success") && tokensCss.includes("--color-danger"), "theme must expose semantic input/status tokens.");
assert(globalCss.includes(".skip-link"), "global CSS must include skip-link styling.");
assert(globalCss.includes(":focus-visible"), "global CSS must include visible focus styling.");
assert(globalCss.includes("min-width: 320px"), "layout must explicitly support the 320px floor.");
assert(globalCss.includes("overflow-x: clip"), "document must guard against horizontal overflow.");
assert(globalCss.includes("aspect-ratio: 1200 / 630"), "article hero dimensions must be reserved.");
assert(globalCss.includes("font-size: 1.0625rem"), "article body should stay in the 16-18px readability range.");
assert(globalCss.includes("max-width: 68ch"), "article body should stay in the 60-75 character readability range.");
assert(articleSource.includes('loading="eager"'), "article LCP image must not be lazy.");
assert(articleSource.includes('fetchpriority="high"'), "article LCP image should be high priority.");
assert(!articleSource.includes("client:"), "Stage 4 must not introduce client hydration.");
assert(!articleHtml.includes("astro-island"), "production HTML must not include hydrated Astro islands.");
assert(articleHtml.includes("Przejdź do treści"), "production HTML must include skip navigation.");
assert(articleHtml.includes("site-nav"), "production HTML must include header navigation.");
assert(articleHtml.includes('src="/scripts/theme.js" defer'), "production HTML must load the deferred theme interaction controller.");
assert(!articleHtml.includes('<script src="/scripts/theme.js"></script>'), "theme must not retain the synchronous external bootstrap.");
assert(articleHtml.indexOf('/scripts/theme.js') > articleHtml.lastIndexOf('</footer>'), "deferred theme interaction controller must stay outside the initial head render path.");
const inlineBootstrap = articleHtml.match(/<script>(\(\(\)=>\{const k="tragarze-theme-preference"[\s\S]*?\}\)\(\);)<\/script>/)?.[1];
assert(inlineBootstrap, "production HTML must inline the deterministic pre-paint theme bootstrap.");
assert(articleHtml.indexOf(inlineBootstrap) < articleHtml.indexOf('stylesheet'), "inline theme bootstrap must precede the stylesheet to prevent a theme flash.");
assert(articleHtml.includes("data-theme-toggle") && articleHtml.includes("data-theme-system"), "header must contain the compact light/dark and system controls.");
assert(articleHtml.includes('class="article-aside-shell"'), "article must have one responsive aside shell.");
assert(articleHtml.includes("Spis treści i informacje"), "mobile must expose one article aside trigger.");
assert((articleHtml.match(/data-rating/g) ?? []).length >= 5 && (articleHtml.match(/data-rating data-api-url/g) ?? []).length === 1, "article must retain one canonical rating interaction.");
assert(articleHtml.includes('class="article-toc"'), "the representative article headings must render a TOC without a minimum-heading threshold.");
assert(articleHtml.includes("Czas czytania") && articleHtml.includes("Komentarze") && articleHtml.includes("Udostępnij"), "article aside must contain the required information sections.");

console.log("Theme static validation passed.");
