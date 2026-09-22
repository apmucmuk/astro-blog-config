import { ApiError } from "../../src/core/api";
import type { Env } from "./types";

type SiteverifyResponse = { success?: boolean; hostname?: string; action?: string; "error-codes"?: string[] };

function validationError(): ApiError {
  return new ApiError(400, "VALIDATION_ERROR", "Turnstile verification failed.", [
    { field: "turnstileToken", message: "Turnstile verification failed." },
  ]);
}

export async function verifyTurnstile(token: string, env: Env, fetcher: typeof fetch = fetch): Promise<void> {
  if (env.APP_ENV === "development" || env.TURNSTILE_MODE === "mock") {
    if (env.APP_ENV !== "development" && env.TURNSTILE_MODE === "mock") {
      throw new ApiError(500, "INTERNAL_ERROR", "Turnstile mock mode is unavailable outside development.");
    }
    if (token === "test-pass") {
      return;
    }
    throw validationError();
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    throw new ApiError(500, "INTERNAL_ERROR", "Turnstile secret is not configured.");
  }

  let result: SiteverifyResponse;
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) throw new Error("Siteverify unavailable");
    result = await response.json() as SiteverifyResponse;
  } catch {
    throw new ApiError(503, "INTERNAL_ERROR", "Turnstile verification is unavailable.");
  }
  const expectedHostname = new URL(env.ALLOWED_ORIGIN).hostname;
  if (!result.success || result.hostname !== expectedHostname || result.action !== "comment") throw validationError();
}
