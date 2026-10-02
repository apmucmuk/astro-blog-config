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

  it("keeps H2 through H6 hierarchy", () => {
    expect(articleToc(headings, true)[0].children[0].children[0].slug).toBe("ignored");
  });

  it("handles skipped levels and headings without H2", () => {
    expect(articleToc([{ depth: 2, slug: "h2", text: "H2" }, { depth: 4, slug: "h4", text: "H4" }, { depth: 6, slug: "h6", text: "H6" }], true)[0].children[0].children[0].slug).toBe("h6");
    expect(articleToc([{ depth: 3, slug: "h3", text: "H3" }], true)[0].slug).toBe("h3");
  });

  it("omits only opted-out or heading-free articles", () => {
    expect(articleToc([], true)).toEqual([]);
    expect(articleToc(headings, false)).toEqual([]);
  });
});
