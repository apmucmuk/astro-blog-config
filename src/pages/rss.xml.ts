import { getCollection } from "astro:content";
import { filterPublished } from "@core/content/lifecycle";
import { articlePath } from "@core/routing/routes";
import { projectConfig } from "@project/site.config";
import { routeSegments } from "@project/routing.config";
import categories from "../content/data/categories.json";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export async function GET() {
  const articles = filterPublished(await getCollection("blog")).filter((article) => !article.data.noindex);
  const items = articles.map((article) => {
    const category = categories.find((item) => item.id === article.data.category);
    if (!category) {
      throw new Error(`Unknown category '${article.data.category}' for article '${article.id}'.`);
    }
    const url = new URL(
      articlePath({ segments: routeSegments, categorySlug: category.slug, articleSlug: article.data.slug }),
      projectConfig.siteUrl,
    ).toString();
    return `<item><title>${escapeXml(article.data.title)}</title><link>${url}</link><guid isPermaLink="false">${escapeXml(article.data.id)}</guid><description>${escapeXml(article.data.description)}</description><pubDate>${article.data.publishDate.toUTCString()}</pubDate></item>`;
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeXml(projectConfig.name)}</title><link>${projectConfig.siteUrl}</link><description>Praktyczne poradniki tragarze.pl</description>${items.join("")}</channel></rss>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
