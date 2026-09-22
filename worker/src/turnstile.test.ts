import { describe, expect, it } from "vitest";
import { verifyTurnstile } from "./turnstile";
import type { Env } from "./types";

const env: Env = {
  APP_ENV: "preview",
  SITE_ID: "tragarze-pl",
  ALLOWED_ORIGIN: "https://tragarze-preview.pages.dev",
  POPULARITY_WINDOW_DAYS: "7",
  VISITOR_COOKIE_NAME: "tragarze_vid",
  TURNSTILE_SECRET_KEY: "test-secret",
  DB: { prepare() { throw new Error("not used"); } },
};

function siteverify(body: unknown, status = 200): typeof fetch {
  return async (input, init) => {
    expect(String(input)).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(URLSearchParams);
    expect((init?.body as URLSearchParams).get("response")).toBe("token");
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };
}

describe("Turnstile verification", () => {
  it("accepts a successful token only for the configured hostname and comment action", async () => {
    await expect(verifyTurnstile("token", env, siteverify({ success: true, hostname: "tragarze-preview.pages.dev", action: "comment" }))).resolves.toBeUndefined();
  });

  it.each([
    { success: false, hostname: "tragarze-preview.pages.dev", action: "comment", "error-codes": ["timeout-or-duplicate"] },
    { success: true, hostname: "evil.example", action: "comment" },
    { success: true, hostname: "tragarze-preview.pages.dev", action: "other" },
  ])("fails closed for invalid, duplicate, hostname or action failures", async (body) => {
    await expect(verifyTurnstile("token", env, siteverify(body))).rejects.toMatchObject({ status: 400, code: "VALIDATION_ERROR" });
  });

  it("fails closed for a missing secret and Siteverify transport failure", async () => {
    await expect(verifyTurnstile("token", { ...env, TURNSTILE_SECRET_KEY: undefined }, siteverify({}))).rejects.toMatchObject({ status: 500 });
    await expect(verifyTurnstile("token", env, async () => { throw new Error("offline"); })).rejects.toMatchObject({ status: 503 });
    await expect(verifyTurnstile("token", env, siteverify({}, 500))).rejects.toMatchObject({ status: 503 });
  });

  it("allows the mock boundary only in development", async () => {
    await expect(verifyTurnstile("test-pass", { ...env, APP_ENV: "development", TURNSTILE_SECRET_KEY: undefined })).resolves.toBeUndefined();
    await expect(verifyTurnstile("test-pass", { ...env, TURNSTILE_MODE: "mock" })).rejects.toMatchObject({ status: 500 });
  });
});
