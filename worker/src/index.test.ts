import { describe, expect, it } from "vitest";
import worker from "./index";
import type { Env } from "./types";

const env: Env = {
  APP_ENV: "development",
  SITE_ID: "tragarze-pl",
  ALLOWED_ORIGIN: "https://tragarze.pl",
  POPULARITY_WINDOW_DAYS: "7",
  VISITOR_COOKIE_NAME: "tragarze_vid",
  DB: {
    prepare() {
      throw new Error("DB should not be used by these route smoke tests.");
    },
  },
};

describe("worker runtime foundation", () => {
  it("serves /health without secrets or database output", async () => {
    const response = await worker.fetch(new Request("https://api.tragarze.pl/health"), env);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toEqual({
      ok: true,
      service: "tragarze-api",
      environment: "development",
    });
    expect(JSON.stringify(body)).not.toContain("DB");
    expect(JSON.stringify(body)).not.toContain("SECRET");
  });

  it("applies exact-origin credentialed CORS for allowed origins only", async () => {
    const allowed = await worker.fetch(
      new Request("https://api.tragarze.pl/health", {
        headers: { Origin: "https://tragarze.pl" },
      }),
      env,
    );
    expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe("https://tragarze.pl");
    expect(allowed.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(allowed.headers.get("Vary")).toContain("Origin");

    const denied = await worker.fetch(
      new Request("https://api.tragarze.pl/health", {
        headers: { Origin: "https://evil.example" },
      }),
      env,
    );
    expect(denied.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("rejects invalid mutation origins with the shared error shape and no-store", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/stats", {
        method: "POST",
        headers: { Origin: "https://evil.example" },
      }),
      env,
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toEqual({
      error: {
        code: "ORIGIN_NOT_ALLOWED",
        message: "Origin is not allowed.",
      },
    });
  });

  it("keeps mutation method errors no-store", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/stats", {
        method: "POST",
        headers: { Origin: "https://tragarze.pl" },
      }),
      env,
    );
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("rejects malformed visitor identity cookies on rating mutations with no-store", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/articles/art-tragarze-001/rating", {
        method: "POST",
        headers: {
          Origin: "https://tragarze.pl",
          Cookie: "tragarze_vid=not-valid",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: 5 }),
      }),
      env,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("exposes a rating rate-limit rejection path with no-store", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/articles/art-tragarze-001/rating", {
        method: "POST",
        headers: {
          Origin: "https://tragarze.pl",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: 5 }),
      }),
      { ...env, RATE_LIMIT_RATINGS: "0" },
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.error.code).toBe("RATE_LIMITED");
  });

  it("fails closed for missing preview mutation limiters before database access", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/articles/art-tragarze-001/rating", {
        method: "POST",
        headers: { Origin: "https://tragarze.pl", "Content-Type": "application/json" },
        body: JSON.stringify({ value: 5 }),
      }),
      { ...env, APP_ENV: "preview" },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("uses the configured public mutation limiter before database access", async () => {
    const response = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/comments", {
        method: "POST",
        headers: { Origin: "https://tragarze.pl", "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: "art-tragarze-001", name: "Jan", body: "ok", turnstileToken: "test-pass" }),
      }),
      { ...env, COMMENT_CREATE_RATE_LIMITER: { limit: async () => ({ success: false }) } },
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("keeps comments mutation errors no-store and exact-origin protected", async () => {
    const invalidOrigin = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/comments", {
        method: "POST",
        headers: {
          Origin: "https://evil.example",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(invalidOrigin.status).toBe(403);
    expect(invalidOrigin.headers.get("Cache-Control")).toBe("no-store");

    const malformed = await worker.fetch(
      new Request("https://api.tragarze.pl/v1/comments", {
        method: "POST",
        headers: {
          Origin: "https://tragarze.pl",
          "Content-Type": "application/json",
        },
        body: "{",
      }),
      env,
    );
    expect(malformed.status).toBe(400);
    expect(malformed.headers.get("Cache-Control")).toBe("no-store");
  });

});
