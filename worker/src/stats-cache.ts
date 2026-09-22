import { runtimeConfig } from "../../src/project/runtime.config";
import { getStats } from "./stats";
import { jsonResponse } from "./responses";
import type { Env } from "./types";

export async function statsResponse(request: Request, env: Env,
  cache = (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)?.default) {
  const key = new URL("/v1/stats", request.url);
  key.search = new URLSearchParams({ site: env.SITE_ID, environment: env.APP_ENV,
    window: env.POPULARITY_WINDOW_DAYS, prior: String(runtimeConfig.ratingPriorWeight), version: "1" }).toString();
  const cacheRequest = new Request(key);
  try {
    const cached = await cache?.match(cacheRequest);
    if (cached) return cached;
  } catch { /* Cache failure falls back to authoritative D1. */ }
  const response = jsonResponse(await getStats(env.DB, env.SITE_ID, Number(env.POPULARITY_WINDOW_DAYS), runtimeConfig.ratingPriorWeight), {
    headers: { "Cache-Control": `public, max-age=${runtimeConfig.statsCacheSeconds}`, Vary: "Origin" },
  });
  try { await cache?.put(cacheRequest, response.clone()); } catch { /* Cache availability is not required for stats correctness. */ }
  return response;
}
