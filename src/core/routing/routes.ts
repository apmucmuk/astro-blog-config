export type RouteSegments = {
  blog: string;
  editorial: string;
};

export function articlePath(input: {
  segments: RouteSegments;
  categorySlug: string;
  articleSlug: string;
}): `/${string}/${string}/${string}/` {
  return `/${input.segments.blog}/${input.categorySlug}/${input.articleSlug}/`;
}

export function listingPath(segment: string): `/${string}/` {
  return `/${segment}/`;
}

export function personPath(input: { segments: RouteSegments; personSlug: string }): `/${string}/${string}/` {
  return `/${input.segments.editorial}/${input.personSlug}/`;
}
