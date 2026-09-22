import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const root = path.resolve("dist");
const server = createServer(async (request, response) => {
  try {
    let file = decodeURIComponent(new URL(request.url, "http://local").pathname);
    if (file.endsWith("/")) file += "index.html";
    const resolved = path.resolve(root, `.${file}`);
    if (!resolved.startsWith(root + path.sep)) throw new Error("Invalid path");
    const body = await readFile(resolved);
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
    response.writeHead(200, { "Content-Type": types[path.extname(resolved)] ?? "application/octet-stream" }); response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const article = "/blog/poradniki/jak-przygotowac-przeprowadzke/";
const id = "art-tragarze-001";
const snapshot = { generatedAt: new Date().toISOString(), articles: [{ id, reads: 42, commentsCount: 0, ratingValue: null, ratingCount: 0 }],
  rankings: { popularNow: [id], popular: [id], comments: [id], rating: [id] } };
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  let reads = 0, stats = 0, manifests = 0;
  context.on("request", (request) => { if (request.url().includes("/manifests/")) manifests++; });
  await context.route("https://api.tragarze.pl/**", async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": base, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, GET" } });
    if (route.request().url().endsWith("/v1/read")) reads++; else stats++;
    await route.fulfill({ json: route.request().url().endsWith("/v1/read") ? { accepted: true } : snapshot,
      headers: { "Access-Control-Allow-Origin": base, "Access-Control-Allow-Credentials": "true" } });
  });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(base + article);
  await page.clock.runFor(9999);
  assert.equal(reads, 0, "Opening alone must not count");
  await page.clock.runFor(1);
  await page.waitForFunction(() => localStorage.getItem("read:tragarze-pl:art-tragarze-001"));
  assert.equal(reads, 1, "10-second detector");
  await page.clock.runFor(60000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  assert.equal(reads, 1, "No heartbeat or duplicate scroll POST");
  await page.reload(); await page.clock.runFor(10001);
  assert.equal(reads, 1, "Refresh dedup");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.querySelector("[data-read-article]").scrollIntoView());
  await page.waitForFunction(() => localStorage.getItem("read:tragarze-pl:art-tragarze-001"));
  assert.equal(reads, 2, "Scroll qualification");
  await page.goto(base + "/blog/");
  const initialStats = stats;
  assert.equal(manifests, 0, "Default static listing does not fetch manifest");
  await page.selectOption("[data-stats-sort]", "popularNow");
  await page.waitForFunction(() => document.querySelector("[data-reads]")?.textContent === "42");
  assert.equal(stats, initialStats + 1); assert.equal(manifests, 1);
  await page.selectOption("[data-stats-sort]", "rating");
  await page.waitForFunction(() => location.search === "?sort=rating");
  assert.equal(stats, initialStats + 1, "One shared batch stats request");
  await page.goBack();
  await page.waitForFunction(() => document.querySelector("select").value === "popularNow");
  await page.goto(base + "/blog/poradniki/");
  assert.deepEqual(await page.locator("[data-stats-sort] option").evaluateAll((options) => options.map((option) => option.value)), ["newest", "popularNow", "rating", "comments", "updated"]);
  await page.selectOption("[data-stats-sort]", "comments");
  await page.waitForFunction(() => location.search === "?sort=comments");
  await page.goto(base + "/redakcja/jan-kowalski/");
  assert.deepEqual(await page.locator("[data-stats-sort] option").evaluateAll((options) => options.map((option) => option.value)), ["newest", "popular", "comments", "updated"]);
  await page.selectOption("[data-stats-sort]", "popular");
  await page.waitForFunction(() => location.search === "?sort=popular");
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 812 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Listing overflow at ${width}`);
  }
  await mkdir(".cache/stage8", { recursive: true });
  await page.screenshot({ path: ".cache/stage8/listing.png", fullPage: true });
  await context.close();
  const offline = await browser.newContext();
  await offline.route("https://api.tragarze.pl/**", (route) => route.abort());
  const fallback = await offline.newPage();
  await fallback.goto(base + "/blog/?sort=rating");
  await fallback.waitForFunction(() => !document.querySelector("[data-stats-error]").hidden);
  assert(await fallback.locator("[data-stats-list] a").count() > 0, "Failure preserves static links");
  assert.equal(await fallback.locator("select").inputValue(), "newest");
  await offline.close();
  const slow = await browser.newContext();
  await slow.route("https://api.tragarze.pl/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({ json: snapshot, headers: { "Access-Control-Allow-Origin": base, "Access-Control-Allow-Credentials": "true" } });
  });
  const slowPage = await slow.newPage();
  await slowPage.goto(base + "/blog/?sort=popular");
  assert(await slowPage.locator("[data-stats-list] a").count() > 0, "Slow API must not block static listing content");
  await slow.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base + "/blog/?sort=rating");
  assert(await staticPage.locator("[data-stats-list] a").count() > 0);
  await staticPage.goto(base + "/blog/poradniki/?sort=rating");
  assert(await staticPage.locator("[data-stats-list] a").count() > 0);
  await staticPage.goto(base + "/redakcja/jan-kowalski/?sort=popular");
  assert(await staticPage.locator("[data-stats-list] a").count() > 0);
  await noJs.close();
  console.log("Stage 8 browser gates PASS: 10s/scroll, single POST, refresh dedup, no heartbeat, lazy batch listing, URL history, API failure, no-JS, widths 320/375/1280.");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
