import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { recordRead } from "./reads";
import { getStats } from "./stats";
import worker from "./index";
import { statsResponse } from "./stats-cache";
import { requireReadCapacity } from "./read-limit";

const databases = [];
function database() {
  const sql = new DatabaseSync(":memory:");
  databases.push(sql);
  for (const file of ["0001_runtime_foundation.sql", "0002_rating_aggregate_triggers.sql", "0003_comments_count_triggers.sql"]) {
    sql.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
  sql.exec("INSERT INTO content_articles VALUES ('site', 'a', 1, 1, 1), ('site', 'b', 2, 1, 1), ('site', 'disabled', 1, 0, 1), ('other', 'a', 1, 1, 1)");
  function prepare(query) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { return sql.prepare(query).get(...values) ?? null; },
      async all() { return { success: true, meta: {}, results: sql.prepare(query).all(...values) }; },
      async run() { sql.prepare(query).run(...values); return { success: true, meta: {} }; },
      execute() { sql.prepare(query).run(...values); return { success: true, meta: {} }; },
    };
  }
  const db = { prepare, async batch(statements) {
    sql.exec("BEGIN");
    try { const results = statements.map((s) => s.execute()); sql.exec("COMMIT"); return results; }
    catch (error) { sql.exec("ROLLBACK"); throw error; }
  } };
  const env = { DB: db, SITE_ID: "site", APP_ENV: "development", ALLOWED_ORIGIN: "https://site.test",
    POPULARITY_WINDOW_DAYS: "7", VISITOR_COOKIE_NAME: "visitor", READ_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  return { sql, db, env };
}
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

describe("reads with real SQLite transactions and accepted migrations", () => {
  it("keeps repeated/concurrent first reads and existing aggregates consistent", async () => {
    const { db, sql } = database();
    await Promise.all(Array.from({ length: 25 }, () => recordRead(db, "site", "a")));
    await Promise.all(Array.from({ length: 25 }, () => recordRead(db, "site", "a")));
    expect(sql.prepare("SELECT reads FROM article_stats").get().reads).toBe(50);
    expect(sql.prepare("SELECT SUM(reads) n FROM article_read_daily").get().n).toBe(50);
    expect(sql.prepare("SELECT COUNT(*) n FROM article_read_daily").get().n).toBe(1);
  });
  it("buckets by UTC across midnight and preserves monotonic timestamps", async () => {
    const { db, sql } = database();
    const midnight = Date.parse("2026-09-17T00:00:00Z");
    await recordRead(db, "site", "a", midnight);
    await recordRead(db, "site", "a", midnight - 1);
    expect(sql.prepare("SELECT day_utc, reads FROM article_read_daily ORDER BY day_utc").all()).toEqual([
      { day_utc: "2026-09-16", reads: 1 }, { day_utc: "2026-09-17", reads: 1 },
    ]);
    expect(sql.prepare("SELECT reads, updated_at_ms FROM article_stats").get()).toEqual({ reads: 2, updated_at_ms: midnight });
  });
  it("rolls back all-time increment when daily write fails", async () => {
    const { db, sql } = database();
    await recordRead(db, "site", "a");
    sql.exec("CREATE TRIGGER fail_read BEFORE UPDATE ON article_read_daily BEGIN SELECT RAISE(ABORT, 'injected'); END");
    await expect(recordRead(db, "site", "a")).rejects.toThrow();
    expect(sql.prepare("SELECT reads FROM article_stats").get().reads).toBe(1);
    expect(sql.prepare("SELECT reads FROM article_read_daily").get().reads).toBe(1);
  });
  it.each(["missing", "disabled"])("rejects %s without stats writes", async (id) => {
    const { db, sql } = database();
    await expect(recordRead(db, "site", id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(sql.prepare("SELECT COUNT(*) n FROM article_stats").get().n).toBe(0);
  });
  it("ranks rolling buckets independently of all-time and isolates sites", async () => {
    const { db, sql } = database();
    const now = Date.parse("2026-09-17T12:00:00Z");
    await recordRead(db, "site", "a", Date.parse("2026-09-10"));
    await recordRead(db, "site", "a", Date.parse("2026-09-10"));
    await recordRead(db, "site", "b", Date.parse("2026-09-11"));
    await recordRead(db, "other", "a", now);
    const snapshot = await getStats(db, "site", 7, 10, now);
    expect(snapshot.rankings.popular).toEqual(["a", "b"]);
    expect(snapshot.rankings.popularNow).toEqual(["b", "a"]);
    expect(snapshot.articles.every((a) => a.ratingValue === null)).toBe(true);
    sql.exec("UPDATE article_stats SET rating_count=1, rating_sum=5 WHERE site_id='site' AND article_id='a'");
    const rated = await getStats(db, "site", 7, 10, now);
    expect(rated.rankings.rating).toEqual(["a", "b"]);
    expect(rated.articles.find((a) => a.id === "a").ratingValue).toBe(5);
    expect(JSON.stringify(rated)).not.toMatch(/ratingScore|rolling_reads|visitor/);
  });
  it("uses stable ties and lazy zero stats without GET writes", async () => {
    const { db, sql } = database();
    const snapshot = await getStats(db, "site", 7);
    expect(snapshot.rankings.rating).toEqual(["b", "a"]);
    expect(snapshot.articles).toHaveLength(2);
    expect(sql.prepare("SELECT COUNT(*) n FROM article_stats").get().n).toBe(0);
    await expect(getStats(db, "site", 0)).rejects.toThrow();
    await expect(getStats(db, "site", 7, 0)).rejects.toThrow();
  });
  it("rejects future registry entries without writes", async () => {
    const { db, sql } = database();
    sql.exec("UPDATE content_articles SET publish_at_ms=9999999999999 WHERE article_id='a'");
    await expect(recordRead(db, "site", "a")).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(sql.prepare("SELECT COUNT(*) n FROM article_stats").get().n).toBe(0);
    expect((await getStats(db, "site", 7)).articles.map((row) => row.id)).toEqual(["b"]);
  });
  it("keeps rating/comments unchanged while incrementing reads", async () => {
    const { db, sql } = database();
    await recordRead(db, "site", "a");
    sql.exec("UPDATE article_stats SET rating_sum=9, rating_count=2, comments_count=3");
    await Promise.all([recordRead(db, "site", "a"), recordRead(db, "site", "a")]);
    expect(sql.prepare("SELECT reads, rating_sum, rating_count, comments_count FROM article_stats").get()).toEqual({ reads: 3, rating_sum: 9, rating_count: 2, comments_count: 3 });
  });
  it("uses Bayesian scores only for ordering and deterministic tie breakers", async () => {
    const { db, sql } = database();
    await recordRead(db, "site", "a"); await recordRead(db, "site", "b");
    sql.exec("UPDATE article_stats SET rating_sum=5,rating_count=1 WHERE article_id='a'; UPDATE article_stats SET rating_sum=450,rating_count=100 WHERE article_id='b'");
    const snapshot = await getStats(db, "site", 7);
    expect(snapshot.articles.find((row) => row.id === "a").ratingValue).toBe(5);
    expect(snapshot.articles.find((row) => row.id === "b").ratingValue).toBe(4.5);
    expect(snapshot.rankings.rating).toEqual(["a", "b"]);
    sql.exec("UPDATE article_stats SET rating_sum=4,rating_count=1; UPDATE content_articles SET publish_at_ms=1");
    expect((await getStats(db, "site", 7)).rankings.rating).toEqual(["a", "b"]);
  });
});

describe("snapshot cache and transient limiting", () => {
  it("reuses a non-personalized cached snapshot and isolates site keys", async () => {
    const { env, db } = database();
    const saved = new Map();
    const cache = { async match(request) { return saved.get(request.url)?.clone(); }, async put(request, response) { saved.set(request.url, response); } };
    const request = new Request("https://api.test/v1/stats?site_id=other", { headers: { Cookie: "visitor=private" } });
    const first = await statsResponse(request, env, cache);
    await recordRead(db, "site", "a");
    const second = await statsResponse(request, env, cache);
    expect(await second.json()).toEqual(await first.json());
    expect(second.headers.get("Set-Cookie")).toBeNull();
    expect(saved.size).toBe(1);
    await statsResponse(request, { ...env, SITE_ID: "other" }, cache);
    expect(saved.size).toBe(2);
    const fresh = await statsResponse(request, env, { async match() { throw Error("offline"); }, async put() { throw Error("offline"); } });
    expect((await fresh.json()).articles.find((row) => row.id === "a").reads).toBe(1);
  });
  it("limits concurrent repeats without persistent history, then expires", async () => {
    const { env, sql } = database();
    const local = { ...env, READ_RATE_LIMITER: undefined, RATE_LIMIT_READS: "1" };
    const results = await Promise.allSettled(Array.from({ length: 10 }, () => requireReadCapacity(local, "test-visitor", "a", 100000)));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    await expect(requireReadCapacity(local, "test-visitor", "a", 160000)).resolves.toBeUndefined();
    expect(sql.prepare("SELECT COUNT(*) n FROM article_stats").get().n).toBe(0);
  });
});

describe("read API security and cache", () => {
  function request(body = '{"articleId":"a"}', origin = "https://site.test", method = "POST") {
    return new Request("https://api.test/v1/read", { method, headers: { Origin: origin, "Content-Type": "application/json" }, ...(method === "POST" ? { body } : {}) });
  }
  it("accepts a read with credentialed CORS, cookie and no-store", async () => {
    const { env } = database();
    const result = await worker.fetch(request(), env);
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ accepted: true });
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(result.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(result.headers.get("Set-Cookie")).toContain("HttpOnly");
  });
  it.each([['{', 400], ['{}', 400], ['{"articleId":"disabled"}', 404], ['{"articleId":"missing"}', 404], ['{"articleId":"a","site_id":"other"}', 400]])("rejects %s", async (body, status) => {
    const { env, sql } = database();
    const result = await worker.fetch(request(body), env);
    expect(result.status).toBe(status);
    expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(sql.prepare("SELECT COUNT(*) n FROM article_read_daily").get().n).toBe(0);
  });
  it("rejects Origin, method and rate limit failures", async () => {
    const { env } = database();
    expect((await worker.fetch(request(undefined, "https://evil.test"), env)).status).toBe(403);
    expect((await worker.fetch(request(undefined, "", "GET"), env)).status).toBe(405);
    const limited = await worker.fetch(request(), { ...env, READ_RATE_LIMITER: { limit: async () => ({ success: false }) } });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Cache-Control")).toBe("no-store");
    expect((await worker.fetch(request(), { ...env, APP_ENV: "production", READ_RATE_LIMITER: undefined })).status).toBe(503);
  });
  it("serves cacheable non-personalized authoritative stats", async () => {
    const { env } = database();
    const response = await worker.fetch(new Request("https://api.test/v1/stats?site_id=other"), env);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect((await response.json()).articles).toHaveLength(2);
  });
});
