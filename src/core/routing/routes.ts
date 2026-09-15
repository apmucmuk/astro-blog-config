export type Locale = "pl";

const routeSegments = {
  pl: {
    blog: "blog",
    editorial: "redakcja",
  },
} as const;

export function localizedBlogPath(locale: Locale): `/${string}/` {
  return `/${routeSegments[locale].blog}/`;
}

export function articlePath(input: {
  locale: Locale;
  categorySlug: string;
  articleSlug: string;
}): `/${string}/${string}/${string}/` {
  const blog = routeSegments[input.locale].blog;
  return `/${blog}/${input.categorySlug}/${input.articleSlug}/`;
}

export function personPath(input: { locale: Locale; personSlug: string }): `/${string}/${string}/` {
  const editorial = routeSegments[input.locale].editorial;
  return `/${editorial}/${input.personSlug}/`;
}
