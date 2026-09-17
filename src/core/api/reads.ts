import { assertStrictObject, requireNonEmptyString } from "./validation";

export type ReadCreateInput = { articleId: string };
export type PublicArticleStatsDTO = {
  id: string;
  reads: number;
  commentsCount: number;
  ratingValue: number | null;
  ratingCount: number;
};
export type StatsSnapshot = {
  generatedAt: string;
  articles: PublicArticleStatsDTO[];
  rankings: Record<"popularNow" | "popular" | "comments" | "rating", string[]>;
};

export function parseReadInput(value: unknown): ReadCreateInput {
  return assertStrictObject(value, {
    keys: ["articleId"],
    parse(record) {
      const articleId = requireNonEmptyString(record.articleId, "articleId");
      if (typeof articleId !== "string") return [articleId];
      if (articleId.length > 200) return [{ field: "articleId", message: "Article ID is too long." }];
      return { articleId };
    },
  });
}
