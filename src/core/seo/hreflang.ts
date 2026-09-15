import { articlePath, type Locale } from "../routing/routes";

export type TranslationRoute = {
  locale: Locale;
  categorySlug: string;
  articleSlug: string;
  siteUrl: string;
};

export function canonicalUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).toString();
}

export function articleCanonical(input: TranslationRoute): string {
  return canonicalUrl(
    articlePath({
      locale: input.locale,
      categorySlug: input.categorySlug,
      articleSlug: input.articleSlug,
    }),
    input.siteUrl,
  );
}

export function hreflangLinks(translations: TranslationRoute[]) {
  return translations.map((translation) => ({
    hreflang: translation.locale,
    href: articleCanonical(translation),
  }));
}
