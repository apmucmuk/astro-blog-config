import { ApiError } from "../../src/core/api";
import { runtimeConfig } from "../../src/project/runtime.config";
import type { Env, RateLimiter } from "./types";

const localLimits = new Map<string, { count: number; expires: number }>();

export async function requireReadCapacity(env: Env, visitorId: string, articleId: string, now = Date.now()) {
  const key = JSON.stringify([env.SITE_ID, articleId, visitorId]);
  let allowed = false;
  if (env.READ_RATE_LIMITER) {
    allowed = (await env.READ_RATE_LIMITER.limit({ key })).success;
  } else if (env.APP_ENV === "development") {
    const limit = Number(env.RATE_LIMIT_READS ?? runtimeConfig.localReadLimitPerMinute);
    if (!Number.isInteger(limit) || limit < 0) throw new ApiError(500, "INTERNAL_ERROR", "Invalid read limit configuration.");
    for (const [id, entry] of localLimits) if (entry.expires <= now) localLimits.delete(id);
    const entry = localLimits.get(key) ?? { count: 0, expires: now + 60000 };
    allowed = entry.count < limit && (localLimits.has(key) || localLimits.size < 10000);
    if (allowed) { entry.count++; localLimits.set(key, entry); }
  } else {
    throw new ApiError(503, "INTERNAL_ERROR", "Read rate limiter is unavailable.");
  }
  if (!allowed) throw new ApiError(429, "RATE_LIMITED", "Read rate limit exceeded.");
}

export async function requirePublicMutationCapacity(
  env: Env,
  limiter: RateLimiter | undefined,
  key: string,
  developmentLimit: string | undefined,
  now = Date.now(),
) {
  let allowed = false;
  if (limiter) {
    allowed = (await limiter.limit({ key })).success;
  } else if (env.APP_ENV === "development") {
    if (developmentLimit === undefined || developmentLimit === "") return;
    const limit = Number(developmentLimit);
    if (!Number.isInteger(limit) || limit < 0) throw new ApiError(500, "INTERNAL_ERROR", "Invalid rate limit configuration.");
    for (const [id, entry] of localLimits) if (entry.expires <= now) localLimits.delete(id);
    const entry = localLimits.get(key) ?? { count: 0, expires: now + 60000 };
    allowed = entry.count < limit && (localLimits.has(key) || localLimits.size < 10000);
    if (allowed) { entry.count++; localLimits.set(key, entry); }
  } else {
    throw new ApiError(503, "INTERNAL_ERROR", "Rate limiter is unavailable.");
  }
  if (!allowed) throw new ApiError(429, "RATE_LIMITED", "Rate limit exceeded.");
}
