export type TocHeading = { depth: number; slug: string; text: string };

export function articleToc(headings: readonly TocHeading[], enabled: boolean): TocHeading[] {
  const entries = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  return enabled && entries.filter((heading) => heading.depth === 2).length >= 3 ? entries : [];
}
