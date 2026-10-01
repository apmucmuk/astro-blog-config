import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_BODY_MIN_LENGTH,
  COMMENT_NAME_MAX_LENGTH,
  COMMENT_NAME_MIN_LENGTH,
  validateCommentForm,
} from "./form";

describe("comment form validation", () => {
  it("enforces trimmed name and body boundaries", () => {
    expect(validateCommentForm("", "To jest poprawny komentarz.")).toContain("co najmniej 2");
    expect(validateCommentForm("A", "To jest poprawny komentarz.")).toContain("co najmniej 2");
    expect(validateCommentForm("A".repeat(COMMENT_NAME_MAX_LENGTH + 1), "To jest poprawny komentarz.")).toContain("maksymalnie 40");
    expect(validateCommentForm("  Jan  ", "         ")).toContain("co najmniej 10");
    expect(validateCommentForm("Jan", "x".repeat(COMMENT_BODY_MIN_LENGTH - 1))).toContain("co najmniej 10");
    expect(validateCommentForm("Jan", "x".repeat(COMMENT_BODY_MAX_LENGTH + 1))).toContain("maksymalnie 1500");
    expect(validateCommentForm("Jan", "Krótki, poprawny komentarz po polsku.")).toBeNull();
  });

  it("exports the form limits used by the markup", () => {
    expect(COMMENT_NAME_MIN_LENGTH).toBe(2);
    expect(COMMENT_NAME_MAX_LENGTH).toBe(40);
    expect(COMMENT_BODY_MIN_LENGTH).toBe(10);
    expect(COMMENT_BODY_MAX_LENGTH).toBe(1500);
  });

  it("updates the counter on input and preserves fields on validation failure", () => {
    const source = readFileSync(new URL("./form.ts", import.meta.url), "utf8");
    expect(source).toContain('bodyInput?.addEventListener("input", updateCharacterCount)');
    expect(source).toContain('characterCount.textContent = `${bodyInput.value.length} / ${COMMENT_BODY_MAX_LENGTH}`');
    expect(source.indexOf("const validationMessage")).toBeLessThan(source.indexOf("if (!token)"));
    expect(source.indexOf("form.reset()")).toBeGreaterThan(source.indexOf("if (!response.ok)"));
  });
});
