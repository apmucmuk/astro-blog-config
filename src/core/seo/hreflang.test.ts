import { describe, expect, it } from "vitest";
import { articleCanonical, hreflangLinks } from "./hreflang";

describe("canonical and hreflang helpers", () => {
  it("builds a canonical article URL from localized route parts", () => {
    expect(
      articleCanonical({
        locale: "pl",
        categorySlug: "poradniki",
        articleSlug: "jak-przygotowac-przeprowadzke",
        siteUrl: "https://tragarze.pl",
      }),
    ).toBe("https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/");
  });

  it("builds representative hreflang links", () => {
    expect(
      hreflangLinks([
        {
          locale: "pl",
          categorySlug: "poradniki",
          articleSlug: "jak-przygotowac-przeprowadzke",
          siteUrl: "https://tragarze.pl",
        },
      ]),
    ).toEqual([
      {
        hreflang: "pl",
        href: "https://tragarze.pl/blog/poradniki/jak-przygotowac-przeprowadzke/",
      },
    ]);
  });
});
