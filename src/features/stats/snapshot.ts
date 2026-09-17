import type { StatsSnapshot } from "../../core/api/reads";

export function parseSnapshot(value: unknown): StatsSnapshot {
  const snapshot = value as StatsSnapshot;
  if (!snapshot || typeof snapshot.generatedAt !== "string" || !Number.isFinite(Date.parse(snapshot.generatedAt)) || !Array.isArray(snapshot.articles)) throw new Error("Invalid stats snapshot");
  const ids = new Set<string>();
  for (const row of snapshot.articles) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id) ||
      ![row.reads, row.commentsCount, row.ratingCount].every((n) => Number.isSafeInteger(n) && n >= 0) ||
      (row.ratingCount === 0 ? row.ratingValue !== null : typeof row.ratingValue !== "number" || !Number.isFinite(row.ratingValue) || row.ratingValue < 1 || row.ratingValue > 5)) throw new Error("Invalid article stats");
    ids.add(row.id);
  }
  for (const key of ["popularNow", "popular", "rating", "comments"] as const) {
    const ranking = snapshot.rankings?.[key];
    if (!Array.isArray(ranking) || ranking.length !== ids.size || new Set(ranking).size !== ids.size || ranking.some((id) => !ids.has(id))) throw new Error("Invalid ranking");
  }
  return snapshot;
}

const requests = new Map<string, Promise<StatsSnapshot | null>>();
export function fetchSnapshot(apiUrl: string): Promise<StatsSnapshot | null> {
  const url = new URL("/v1/stats", apiUrl).href;
  let request = requests.get(url);
  if (!request) {
    request = fetch(url, { credentials: "omit" }).then(async (response) => {
      if (!response.ok) throw new Error("Stats unavailable");
      return parseSnapshot(await response.json());
    }).catch(() => null);
    requests.set(url, request);
  }
  return request;
}
