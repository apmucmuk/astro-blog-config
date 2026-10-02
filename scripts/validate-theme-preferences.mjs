import { spawn } from "node:child_process";
import { chromium, firefox } from "playwright-core";

const baseUrl = "http://127.0.0.1:4323";
const articlePath = "/blog/poradniki/jak-przygotowac-przeprowadzke/";
const browsers = [
  { name: "Chromium", launcher: chromium, path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
  { name: "Firefox", launcher: firefox, path: "C:\\Program Files\\Mozilla Firefox\\firefox.exe" },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, message) { if (!condition) throw new Error(message); }
async function waitForUrl(url) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* server is starting */ }
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function startPreview() {
  const child = spawn(process.execPath, ["scripts/run-astro.mjs", "preview", "--host", "127.0.0.1", "--port", "4323"], { cwd: process.cwd(), stdio: "ignore" });
  await waitForUrl(`${baseUrl}/`);
  return child;
}
async function stopPreview() {
  await new Promise((resolve) => { const child = spawn(process.execPath, ["scripts/run-astro.mjs", "preview", "stop"], { cwd: process.cwd(), stdio: "ignore" }); child.on("exit", resolve); });
}
async function newPage(browser, colorScheme, preference, unavailableStorage = false) {
  const context = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: "reduce" });
  await context.addInitScript(({ preference: stored, unavailable }) => {
    if (unavailable) Object.defineProperty(window, "localStorage", { configurable: true, get: () => { throw new Error("storage unavailable"); } });
    else if (stored !== undefined) localStorage.setItem("tragarze-theme-preference", stored);
  }, { preference, unavailable: unavailableStorage });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${articlePath}`, { waitUntil: "domcontentloaded" });
  return { context, page };
}
async function theme(page) { return page.evaluate(() => document.documentElement.dataset.theme); }

let preview;
try {
  preview = await startPreview();
  for (const candidate of browsers) {
    if (!await (async () => { try { return !!candidate.path && await import("node:fs/promises").then(({ access }) => access(candidate.path).then(() => true).catch(() => false)); } catch { return false; } })()) continue;
    let browser;
    try {
      browser = await candidate.launcher.launch({ executablePath: candidate.path, headless: true });
    } catch {
      console.log(`Theme preference validation unavailable: ${candidate.name} is not compatible with this Playwright runtime.`);
      continue;
    }
    try {
      for (const [scheme, stored, expected] of [["light", undefined, "light"], ["dark", undefined, "dark"], ["dark", "light", "light"], ["light", "dark", "dark"], ["light", "invalid", "light"]]) {
        const { context, page } = await newPage(browser, scheme, stored);
        assert(await theme(page) === expected, `${candidate.name}: expected ${expected} for ${scheme}/${stored}`);
        await context.close();
      }
      const { context, page } = await newPage(browser, "light", "system");
      await page.emulateMedia({ colorScheme: "dark" }); await wait(50);
      assert(await theme(page) === "dark", `${candidate.name}: system preference must follow OS changes`);
      await page.locator("[data-theme-toggle]").click();
      await page.emulateMedia({ colorScheme: "light" }); await wait(50);
      assert(await theme(page) === "light", `${candidate.name}: explicit preference must ignore OS changes`);
      await page.locator("[data-theme-system]").click();
      assert(await theme(page) === "light", `${candidate.name}: return to system must use current OS preference`);
      await page.emulateMedia({ colorScheme: "dark" }); await wait(50);
      assert(await theme(page) === "dark", `${candidate.name}: system must resume OS tracking`);
      await page.goto(`${baseUrl}/blog/`, { waitUntil: "domcontentloaded" });
      assert(await theme(page) === "dark", `${candidate.name}: preference must survive navigation`);
      await page.goBack({ waitUntil: "domcontentloaded" });
      assert(await theme(page) === "dark", `${candidate.name}: preference must survive back navigation`);
      const motion = await page.locator(".theme-control").first().evaluate((element) => getComputedStyle(element).transitionDuration);
      assert(motion === "0s", `${candidate.name}: reduced motion must not animate the theme controls`);
      await context.close();
      const unavailable = await newPage(browser, "dark", undefined, true);
      assert(await theme(unavailable.page) === "dark", `${candidate.name}: unavailable storage must fall back to system`);
      await unavailable.context.close();
      console.log(`Theme preference validation passed: ${candidate.name}`);
    } finally { await browser.close(); }
  }
} finally {
  if (preview) preview.kill();
  await stopPreview();
}
