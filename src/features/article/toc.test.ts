import { describe, expect, it } from "vitest";
import { articleAsideLabel, articleToc } from "./toc";

describe("article TOC", () => {
  const headings = [
    { depth: 2, slug: "one", text: "One" },
    { depth: 3, slug: "one-a", text: "One A" },
    { depth: 4, slug: "one-a-i", text: "One A I" },
    { depth: 5, slug: "one-a-i-a", text: "One A I A" },
    { depth: 6, slug: "one-a-i-a-i", text: "One A I A I" },
    { depth: 2, slug: "two", text: "Two" },
    { depth: 3, slug: "two-a", text: "Two A" },
    { depth: 2, slug: "three", text: "Three" },
  ];

  it("keeps the complete H2 through H6 hierarchy", () => {
    const tree = articleToc(headings, true);
    expect(tree[0].children[0].children[0].children[0].children[0].slug).toBe("one-a-i-a-i");
  });

  it("shows a TOC for a single H2", () => {
    expect(articleToc([{ depth: 2, slug: "only-h2", text: "Only H2" }], true).map((entry) => entry.slug)).toEqual(["only-h2"]);
  });

  it("handles skipped levels and headings without H2", () => {
    expect(articleToc([{ depth: 2, slug: "h2", text: "H2" }, { depth: 4, slug: "h4", text: "H4" }, { depth: 6, slug: "h6", text: "H6" }], true)[0].children[0].children[0].slug).toBe("h6");
    expect(articleToc([{ depth: 3, slug: "h3", text: "H3" }], true)[0].slug).toBe("h3");
  });

  it("omits only opted-out or heading-free articles", () => {
    expect(articleToc([], true)).toEqual([]);
    expect(articleToc(headings, false)).toEqual([]);
  });

  it("uses the TOC-aware mobile label while article information remains independently available", () => {
    expect(articleAsideLabel(true)).toBe("Spis treści i informacje");
    expect(articleAsideLabel(false)).toBe("Informacje o artykule");
  });
});
