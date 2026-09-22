import type { StatsSnapshot } from "../../core/api/reads";

export type ListingEntry = {
  id: string; url: string; locale: string; title: string; description: string;
  publishDate: string; updatedDate?: string; updateNote?: string;
  category: string; tags: string[]; authors: string[]; contributors: string[]; image: { src: string; alt: string };
};

export function collectionPage(entries: ListingEntry[], sort: string, page: number, pageSize: number,
  locale: string, snapshot?: StatsSnapshot | null, member: (entry: ListingEntry) => boolean = () => true) {
  let ordered = entries.filter((entry) => entry.locale === locale && member(entry));
  const tie = (a: ListingEntry, b: ListingEntry) => Date.parse(b.publishDate) - Date.parse(a.publishDate) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (sort === "updated") {
    ordered = ordered.filter((entry) => entry.updatedDate).sort((a, b) => Date.parse(b.updatedDate!) - Date.parse(a.updatedDate!) || tie(a, b));
  } else if (sort === "newest") {
    ordered.sort(tie);
  } else {
    const ranking = snapshot?.rankings[sort as keyof StatsSnapshot["rankings"]];
    if (!ranking) throw new Error("Missing ranking");
    const byId = new Map(ordered.map((entry) => [entry.id, entry]));
    ordered = ranking.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
  }
  return { items: ordered.slice((page - 1) * pageSize, page * pageSize), total: ordered.length };
}

export function listingUrl(base: string, page: number, sort: string) {
  return `${base}${page > 1 ? `page/${page}/` : ""}${sort === "newest" ? "" : `?sort=${encodeURIComponent(sort)}`}`;
}
