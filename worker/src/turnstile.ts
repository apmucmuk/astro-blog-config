import { ApiError } from "../../src/core/api";
import type { Env } from "./types";

export async function verifyTurnstile(token: string, env: Env): Promise<void> {
  if (env.TURNSTILE_MODE === "mock" || env.APP_ENV === "development") {
    if (token === "test-pass") {
      return;
    }
    throw new ApiError(400, "VALIDATION_ERROR", "Turnstile verification failed.", [
      { field: "turnstileToken", message: "Turnstile verification failed." },
    ]);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    throw new ApiError(500, "INTERNAL_ERROR", "Turnstile secret is not configured.");
  }

  throw new ApiError(503, "INTERNAL_ERROR", "Turnstile production verification is not available in local tests.");
}
