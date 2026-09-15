import { describe, expect, it } from "vitest";
import { filterPublished, isPublished } from "./lifecycle";

const now = new Date("2026-09-15T10:00:00Z");

describe("content lifecycle", () => {
  it("excludes drafts", () => {
    expect(isPublished({ data: { draft: true, publishDate: "2026-09-01T10:00:00Z" } }, now)).toBe(false);
  });

  it("excludes scheduled entries", () => {
    expect(isPublished({ data: { publishDate: "2099-01-01T10:00:00Z" } }, now)).toBe(false);
  });

  it("keeps only published entries", () => {
    const entries = [
      { data: { publishDate: "2026-09-01T10:00:00Z" } },
      { data: { draft: true, publishDate: "2026-09-01T10:00:00Z" } },
      { data: { publishDate: "2099-01-01T10:00:00Z" } },
    ];

    expect(filterPublished(entries, now)).toHaveLength(1);
  });
});
