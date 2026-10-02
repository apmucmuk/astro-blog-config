import { describe, expect, it } from "vitest";
import { articleToc } from "./toc";

describe("article TOC", () => {
  const headings = [
    { depth: 2, slug: "one", text: "One" },
    { depth: 3, slug: "one-a", text: "One A" },
    { depth: 4, slug: "ignored", text: "Ignored" },
    { depth: 2, slug: "two", text: "Two" },
    { depth: 3, slug: "two-a", text: "Two A" },
    { depth: 2, slug: "three", text: "Three" },
  ];

  it("keeps H2/H3 hierarchy only when at least three H2 exist", () => {
    expect(articleToc(headings, true).map((heading) => heading.slug)).toEqual(["one", "one-a", "two", "two-a", "three"]);
  });

  it("omits the TOC for short or opted-out articles", () => {
    expect(articleToc(headings.slice(0, 4), true)).toEqual([]);
    expect(articleToc(headings, false)).toEqual([]);
  });
});
