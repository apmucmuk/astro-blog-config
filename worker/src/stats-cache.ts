import { runtimeConfig } from "../../src/project/runtime.config";
import { getStats } from "./stats";
import { jsonResponse } from "./responses";
import type { Env } from "./types";

function statsCacheRequest(env: Env): Request {
  const key = new URL("/v1/stats", env.ALLOWED_ORIGIN);
  key.search = new URLSearchParams({ site: env.SITE_ID, environment: env.APP_ENV,
    window: env.POPULARITY_WINDOW_DAYS, prior: String(runtimeConfig.ratingPriorWeight), version: "2" }).toString();
  return new Request(key);
}

export async function invalidateStatsCache(env: Env,
  cache = (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)?.default): Promise<void> {
  try { await cache?.delete(statsCacheRequest(env)); } catch { /* Cache availability is not required for stats correctness. */ }
}

export async function statsResponse(env: Env,
  cache = (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)?.default) {
  // The cache key must be stable across request hosts and is purged after comment moderation mutations.
  const cacheRequest = statsCacheRequest(env);
  try {
    const cached = await cache?.match(cacheRequest);
    if (cached) return cached;
  } catch { /* Cache failure falls back to authoritative D1. */ }
  const response = jsonResponse(await getStats(env.DB, env.SITE_ID, Number(env.POPULARITY_WINDOW_DAYS), runtimeConfig.ratingPriorWeight), {
    // Keep the snapshot private to Workers Cache: browser/proxy caches must not serve a stale comments_count.
    headers: { "Cache-Control": "no-store", Vary: "Origin" },
  });
  try { await cache?.put(cacheRequest, response.clone()); } catch { /* Cache availability is not required for stats correctness. */ }
  return response;
}
