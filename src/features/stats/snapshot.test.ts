import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSnapshot, parseSnapshot } from "./snapshot";

const valid = { generatedAt: "2026-09-17T00:00:00Z", articles: [{ id: "a", reads: 1, commentsCount: 0, ratingValue: null, ratingCount: 0 }], rankings: { popular: ["a"], popularNow: ["a"], comments: ["a"], rating: ["a"] } };
afterEach(() => vi.unstubAllGlobals());
describe("batch snapshot consumer", () => {
  it("validates zero ratings and rejects duplicate/malformed data", () => {
    expect(parseSnapshot(valid)).toEqual(valid);
    expect(() => parseSnapshot({ ...valid, articles: [...valid.articles, ...valid.articles] })).toThrow();
    expect(() => parseSnapshot({ ...valid, rankings: { ...valid.rankings, rating: ["missing"] } })).toThrow();
    expect(() => parseSnapshot({ ...valid, articles: [{ ...valid.articles[0], ratingValue: 5 }] })).toThrow();
  });
  it("shares one request across every consumer", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(valid)));
    vi.stubGlobal("fetch", fetcher);
    const results = await Promise.all(Array.from({ length: 20 }, () => fetchSnapshot("https://batch.test")));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(results.every((result) => result?.articles.length === 1)).toBe(true);
  });
  it("returns a static fallback on network or invalid snapshot failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await fetchSnapshot("https://offline.test")).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")));
    expect(await fetchSnapshot("https://malformed.test")).toBeNull();
  });
});
