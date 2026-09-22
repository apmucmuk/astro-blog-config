import { readFile, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import path from "node:path";

const dist = path.resolve(process.cwd(), "dist");
const readDist = (file) => readFile(path.join(dist, file), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const search = await readDist("szukaj/index.html");
assert(search.includes('meta name="robots" content="noindex,follow"'), "Search page must be noindex.");
assert(search.includes('role="search"'), "Search page must expose a search landmark.");
assert(search.includes("Wyszukiwanie jest dostępne po włączeniu JavaScript"), "Search page needs a no-JS fallback.");

const pagefindFiles = await readdir(path.join(dist, "pagefind"));
const indexFiles = await readdir(path.join(dist, "pagefind", "index"));
assert(pagefindFiles.includes("pagefind.js"), "Production Pagefind module is missing.");
assert(indexFiles.some((file) => file.endsWith(".pf_index")), "Production Pagefind index is missing.");

const article = await readDist("blog/poradniki/jak-przygotowac-przeprowadzke/index.html");
assert(article.includes("data-pagefind-body"), "Published article must be marked as Pagefind content.");
assert(article.includes('data-pagefind-meta="title"'), "Published article title metadata is missing.");

const draft = await readDist("blog/poradniki/jak-przygotowac-przeprowadzke/index.html");
assert(!draft.includes("szkic-przeprowadzki") && !draft.includes("zaplanowana-przeprowadzka"), "Draft/scheduled content leaked into published output.");

const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://localhost:4321";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPreview() {
  for (let elapsed = 0; elapsed < 15_000; elapsed += 150) {
    try {
      if ((await fetch(`${baseUrl}/szukaj/`)).ok) return;
    } catch {
      // Preview has not opened its port yet.
    }
    await wait(150);
  }
  throw new Error("Timed out waiting for the production preview.");
}

const preview = spawn(process.execPath, ["scripts/run-astro.mjs", "preview", "--", "--host", "127.0.0.1"], {
  cwd: process.cwd(),
  stdio: "ignore",
});
let browser;
try {
  await waitForPreview();
  browser = await chromium.launch({ executablePath: chromePath, headless: false, args: ["--disable-gpu", "--no-first-run"] });

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 }, isMobile: true });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(`${baseUrl}/szukaj/`, { waitUntil: "domcontentloaded" });
  assert((await noJsPage.locator("noscript").textContent())?.includes("Wyszukiwanie jest dostępne"), "No-JS fallback is missing.");
  assert(await noJsPage.locator("body").evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Search page overflows at 320px.");
  await noJs.close();

  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto(`${baseUrl}/szukaj/`, { waitUntil: "networkidle" });
  await page.locator("#search-query").fill("przygotować przeprowadzkę");
  await page.locator(".search-form").press("Enter");
  await page.waitForFunction(() => !document.querySelector("[data-search-status]")?.textContent?.includes("Wyszukiwanie..."));
  const searchStatus = await page.locator("[data-search-status]").textContent();
  assert(searchStatus?.startsWith("Znaleziono"), `Published search failed: ${searchStatus}; ${browserErrors.join(" | ")}`);
  const resultHref = await page.locator(".search-results a").first().getAttribute("href");
  assert(resultHref === "/blog/poradniki/jak-przygotowac-przeprowadzke/", `Unexpected result URL: ${resultHref}`);
  assert(!await page.locator(".search-results").innerText().then((text) => text.includes("Szkic artykułu") || text.includes("Zaplanowany")), "Forbidden content appeared in search results.");
  await page.locator("#search-query").focus();
  assert(await page.evaluate(() => document.activeElement?.id === "search-query"), "Search input cannot receive keyboard focus.");
  await context.close();
} finally {
  await browser?.close();
  if (!preview.killed) preview.kill();
}

console.log("Search/Pagefind production validation passed.");
