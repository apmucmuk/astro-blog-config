import { describe, expect, it } from "vitest";
import { formatRatingSummary } from "./island";

describe("rating presentation", () => {
  it("keeps the zero-vote state non-numeric and formats real aggregates", () => {
    const labels = { empty: "Brak ocen", singular: "ocena", plural: "ocen" };
    expect(formatRatingSummary(null, 0, labels)).toBe("Brak ocen");
    expect(formatRatingSummary(5, 1, labels)).toBe("5,0 / 5 · 1 ocena");
    expect(formatRatingSummary(4.25, 8, labels)).toBe("4,3 / 5 · 8 ocen");
  });
});
