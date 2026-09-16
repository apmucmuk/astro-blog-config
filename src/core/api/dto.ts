export type HealthResponse = {
  ok: true;
  service: "tragarze-api";
  environment: "development" | "preview" | "production";
};

export type RuntimeArticle = {
  siteId: string;
  articleId: string;
  publishAtMs: number;
  runtimeEnabled: boolean;
  updatedAtMs: number;
};

export type ArticleStats = {
  siteId: string;
  articleId: string;
  reads: number;
  commentsCount: number;
  ratingSum: number;
  ratingCount: number;
  updatedAtMs: number;
};
