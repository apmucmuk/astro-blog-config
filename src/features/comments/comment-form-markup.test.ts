import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("article comment form markup", () => {
  it("keeps the client limits, counter and accessible association", () => {
    const source = readFileSync(new URL("../../pages/blog/[category]/[slug].astro", import.meta.url), "utf8");
    expect(source).toContain("<form novalidate data-comment-form");
    expect(source).toContain('name="name" required minlength="2" maxlength="40"');
    expect(source).toContain('name="body" required minlength="10" maxlength="1500"');
    expect(source).toContain('aria-describedby="comment-character-count"');
    expect(source).toContain('data-comment-character-count');
    expect(source).toContain("0 / 1500");
  });
});
