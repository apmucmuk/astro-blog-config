import { describe, expect, it } from "vitest";
import { collectionPage, listingUrl, type ListingEntry } from "./collection";
import type { StatsSnapshot } from "../../core/api/reads";

const entries = Array.from({ length: 45 }, (_, i) => ({ id: String(i), locale: "pl", publishDate: new Date(1000 + i).toISOString(),
  ...(i % 2 ? { updatedDate: new Date(2000 + i).toISOString() } : {}),
})) as ListingEntry[];
describe("global listing ordering", () => {
  it("filters membership then ranks all entries before pagination", () => {
    const ranking = ["foreign", ...entries.map((entry) => entry.id)];
    const snapshot = { rankings: { popularNow: ranking } } as StatsSnapshot;
    expect(collectionPage(entries, "popularNow", 2, 20, "pl", snapshot).items.map((entry) => entry.id)).toEqual(entries.slice(20, 40).map((entry) => entry.id));
    expect(collectionPage(entries, "popularNow", 1, 20, "en", snapshot).total).toBe(0);
  });
  it("updated excludes missing dates and newest needs no snapshot", () => {
    expect(collectionPage(entries, "updated", 1, 20, "pl").total).toBe(22);
    expect(collectionPage(entries, "newest", 1, 20, "pl").items[0].id).toBe("44");
    expect(() => collectionPage(entries, "rating", 1, 20, "pl")).toThrow();
  });
  it("keeps sort in pagination without page/1", () => {
    expect(listingUrl("/blog/", 1, "newest")).toBe("/blog/");
    expect(listingUrl("/blog/", 2, "rating")).toBe("/blog/page/2/?sort=rating");
  });
});
