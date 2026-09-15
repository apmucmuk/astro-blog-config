import { getCollection } from "astro:content";
import { filterPublished } from "@core/content/lifecycle";
import { articlePath } from "@core/routing/routes";
import { projectConfig } from "@project/site.config";
import { routeSegments } from "@project/routing.config";
import categories from "../content/data/categories.json";

export async function GET() {
  const articles = filterPublished(await getCollection("blog"));
  const redirects = articles.flatMap((article) => {
    const category = categories.find((item) => item.id === article.data.category);
    if (!category) {
      throw new Error(`Unknown category '${article.data.category}' for article '${article.id}'.`);
    }
    const destination = articlePath({
      segments: routeSegments,
      categorySlug: category.slug,
      articleSlug: article.data.slug,
    });

    return article.data.redirectFrom.map((source) => ({
      source,
      destination,
      status: 301,
    }));
  });

  return new Response(JSON.stringify({ site: projectConfig.siteId, redirects }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
