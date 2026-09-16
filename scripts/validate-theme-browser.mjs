import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://localhost:4321";
const articlePath = "/blog/poradniki/jak-przygotowac-przeprowadzke/";
const widths = [320, 390, 430, 768, 1280];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // wait and retry
    }
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startPreview() {
  const child = spawn(process.execPath, ["scripts/run-astro.mjs", "preview", "--", "--host", "127.0.0.1"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  await waitForUrl(`${baseUrl}/sitemap.xml`);
  return child;
}

async function stopPreview() {
  await new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/run-astro.mjs", "preview", "stop"], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    child.on("exit", resolve);
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

let preview;
let browser;

try {
  preview = await startPreview();
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: false,
    args: [
      "--disable-gpu",
      "--disable-extensions",
      "--disable-default-apps",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  for (const width of widths) {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
      isMobile: width <= 430,
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${articlePath}`, { waitUntil: "domcontentloaded" });

    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      text: document.body.innerText,
      hero: (() => {
        const image = document.querySelector(".article-hero");
        return image
          ? {
              loading: image.getAttribute("loading"),
              fetchPriority: image.getAttribute("fetchpriority"),
              width: image.getAttribute("width"),
              height: image.getAttribute("height"),
              renderedWidth: Math.round(image.getBoundingClientRect().width),
              renderedHeight: Math.round(image.getBoundingClientRect().height),
            }
          : null;
      })(),
      articleWidth: Math.round(document.querySelector(".article-body").getBoundingClientRect().width),
    }));

    assert(metrics.scrollWidth <= metrics.width, `Horizontal overflow at ${width}px: scrollWidth=${metrics.scrollWidth}`);
    assert(
      metrics.text.includes("Jak przygotować przeprowadzkę mieszkania"),
      `Article is not readable with JS disabled at ${width}px.`,
    );
    assert(metrics.hero, `Article hero image is missing at ${width}px.`);
    assert(metrics.hero.loading !== "lazy", `LCP image must not be lazy at ${width}px.`);
    assert(metrics.hero.fetchPriority === "high", `LCP image should use high fetch priority at ${width}px.`);
    assert(metrics.hero.width === "1200" && metrics.hero.height === "630", `Hero intrinsic dimensions failed at ${width}px.`);
    assert(metrics.hero.renderedWidth > 0 && metrics.hero.renderedHeight > 0, `Hero rendered dimensions failed at ${width}px.`);
    assert(metrics.articleWidth <= metrics.width, `Article measure overflows viewport at ${width}px.`);

    await context.close();
  }

  const context = await browser.newContext({
    javaScriptEnabled: true,
    viewport: { width: 390, height: 900 },
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${articlePath}`, { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => ({
    href: document.activeElement?.getAttribute("href"),
    className: document.activeElement?.className,
    outline: getComputedStyle(document.activeElement).outlineStyle,
  }));

  assert(focus.href === "#main", "Keyboard focus should land on skip link first.");
  assert(String(focus.className).includes("skip-link"), "Focused element should be the skip link.");
  assert(focus.outline !== "none", "Focused skip link must have a visible outline.");
  await context.close();

  console.log("Theme browser validation passed.");
} finally {
  if (browser) {
    await browser.close();
  }
  if (preview) {
    preview.kill();
  }
  await stopPreview();
}
