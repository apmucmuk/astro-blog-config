import { projectConfig } from "@project/site.config";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${projectConfig.siteUrl}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
