import { describe, expect, it } from "vitest";
import { blogPostingJsonLd } from "./metadata";

const base = {
  headline: "Tytuł", description: "Opis", url: "https://tragarze.pl/blog/test/", datePublished: "2026-09-01T00:00:00.000Z",
  author: [{ name: "Jan Kowalski", url: "https://tragarze.pl/redakcja/jan-kowalski/" }], image: "https://tragarze.pl/images/test.png",
  publisher: { name: "tragarze.pl", url: "https://tragarze.pl" },
};

describe("BlogPosting structured data", () => {
  it("keeps optional fields consistent and omits aggregateRating without real votes", () => {
    const posting = blogPostingJsonLd(base);
    expect(posting.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": base.url });
    expect(posting.publisher).toEqual({ "@type": "Organization", name: "tragarze.pl", url: "https://tragarze.pl" });
    expect(posting).not.toHaveProperty("aggregateRating");
    expect(posting.dateModified).toBe(base.datePublished);
  });
  it("uses only a real public aggregate, never an internal ranking score", () => {
    const posting = blogPostingJsonLd({ ...base, rating: { ratingValue: 4.25, ratingCount: 8 } });
    expect(posting).toMatchObject({ aggregateRating: { "@type": "AggregateRating", ratingValue: 4.25, ratingCount: 8, bestRating: 5, worstRating: 1 } });
  });
});
