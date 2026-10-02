import { canonicalUrl } from "./hreflang";
import { defaultRobots } from "./launch";

export type SeoMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  siteUrl: string;
  noindex?: boolean;
};

export function seoMetadata(input: SeoMetadataInput) {
  return {
    title: input.title,
    description: input.description,
    canonical: canonicalUrl(input.pathname, input.siteUrl),
    robots: input.noindex ? "noindex,follow" : defaultRobots,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogPostingJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: Array<{ name: string; url: string }>;
  image?: string;
  publisher: { name: string; url: string };
  rating?: { ratingValue: number; ratingCount: number };
}) {
  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: input.author.map((person) => ({
      "@type": "Person",
      name: person.name,
      url: person.url,
    })),
    image: input.image,
    publisher: { "@type": "Organization", name: input.publisher.name, url: input.publisher.url },
  };
  return input.rating && input.rating.ratingCount > 0 ? {
    ...posting,
    aggregateRating: { "@type": "AggregateRating", ratingValue: input.rating.ratingValue, ratingCount: input.rating.ratingCount, bestRating: 5, worstRating: 1 },
  } : posting;
}

export function personProfileJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: input.url,
    mainEntity: {
      "@type": "Person",
      name: input.name,
      description: input.description,
      url: input.url,
      image: input.image,
    },
  };
}
