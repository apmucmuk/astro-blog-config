import { getCollection } from "astro:content";
import { filterPublished } from "@core/content/lifecycle";
import { articlePath, personPath } from "@core/routing/routes";
import { projectConfig } from "@project/site.config";
import { routeSegments } from "@project/routing.config";
import categories from "../content/data/categories.json";

export async function GET() {
  const articles = filterPublished(await getCollection("blog")).filter((article) => !article.data.noindex);
  const people = (await getCollection("people")).filter((person) => !person.data.noindex);
  const urls = [
    "/",
    "/redakcja/",
    ...people.map((person) => personPath({ segments: routeSegments, personSlug: person.data.slug })),
    ...articles.map((article) => {
      const category = categories.find((item) => item.id === article.data.category);
      if (!category) {
        throw new Error(`Unknown category '${article.data.category}' for article '${article.id}'.`);
      }
      return articlePath({
        segments: routeSegments,
        categorySlug: category.slug,
        articleSlug: article.data.slug,
      });
    }),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${new URL(url, projectConfig.siteUrl).toString()}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
