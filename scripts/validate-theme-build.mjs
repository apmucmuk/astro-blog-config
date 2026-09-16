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

assert(tokensCss.includes("color-scheme: light dark"), "tokens must declare light/dark color-scheme.");
assert(tokensCss.includes("@media (prefers-color-scheme: dark)"), "dark scheme must use system preference.");
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

console.log("Theme static validation passed.");
