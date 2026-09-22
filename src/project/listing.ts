import { createHash } from "node:crypto";
import { getCollection } from "astro:content";
import { filterPublished } from "../core/content/lifecycle";
import { articleCanonical } from "../core/seo/hreflang";
import type { ListingEntry } from "../features/stats/collection";
import { projectConfig } from "./site.config";
import { routeSegments } from "./routing.config";
import categories from "../content/data/categories.json";

export const listingPageSize = 20;
export async function buildListing() {
  const entries: ListingEntry[] = filterPublished(await getCollection("blog")).map(({ data }) => ({
    id: data.id, title: data.title, description: data.description, locale: data.locale,
    publishDate: data.publishDate.toISOString(), updatedDate: data.updatedDate?.toISOString(), updateNote: data.updateNote,
    category: data.category, tags: data.tags, people: [...data.authors, ...data.contributors.map((person) => person.person)],
    image: data.image,
    url: articleCanonical({ locale: data.locale, segments: routeSegments, siteUrl: projectConfig.siteUrl,
      categorySlug: categories.find((category) => category.id === data.category)!.slug, articleSlug: data.slug }),
  }));
  entries.sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate) || a.id.localeCompare(b.id));
  const body = JSON.stringify(entries);
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 16);
  return { entries, body, hash, manifestUrl: `/manifests/listing-${hash}.json` };
}
