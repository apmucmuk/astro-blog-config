type Options = {
  siteId: string;
  articleId: string;
  windowMs: number;
  now: () => number;
  storage: Pick<Storage, "getItem" | "setItem">;
  send: () => Promise<boolean>;
};

export function createReadDetector(options: Options) {
  let qualified = false;
  const key = `read:${options.siteId}:${options.articleId}`;
  return async (elapsedMs: number, progress: number) => {
    if (qualified || (elapsedMs < 10000 && progress < 0.25)) return;
    qualified = true;
    try {
      const timestamp = Number(options.storage.getItem(key));
      const age = options.now() - timestamp;
      if (timestamp > 0 && age >= 0 && age < options.windowMs) return;
    } catch { /* Storage can be unavailable in private or restricted browsers. */ }
    try {
      if (await options.send()) {
        try { options.storage.setItem(key, String(options.now())); } catch { /* Page-session dedup still applies. */ }
      }
    } catch { /* Runtime failure must leave the article usable. No automatic retries. */ }
  };
}

export function mountReadDetector(element: HTMLElement) {
  const { siteId, articleId, apiUrl, dedupSeconds } = element.dataset;
  if (!siteId || !articleId || !apiUrl) return;
  const started = Date.now();
  const storage = {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  };
  const detect = createReadDetector({ siteId, articleId, windowMs: Number(dedupSeconds) * 1000,
    now: Date.now, storage, send: async () => {
      const response = await fetch(new URL("/v1/read", apiUrl), { method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId }) });
      return response.ok && (await response.json()).accepted === true;
    } });
  const sample = () => {
    const rect = element.getBoundingClientRect();
    const progress = rect.height > 0 ? Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height)) : 0;
    const elapsed = Date.now() - started;
    if (elapsed >= 10000 || progress >= 0.25) {
      cleanup();
      void detect(elapsed, progress);
    }
  };
  const timer = window.setTimeout(sample, 10000);
  const cleanup = () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", sample);
    window.removeEventListener("pagehide", cleanup);
  };
  window.addEventListener("scroll", sample, { passive: true });
  window.addEventListener("pagehide", cleanup, { once: true });
}
