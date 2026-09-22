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

export type RatingResponse = {
  ratingValue: number | null;
  ratingCount: number;
  myRating: number | null;
};

export type RatingRequest = {
  value: number;
};

export type CommentLinkRel = "dofollow" | "nofollow" | "sponsored";
export type CommentStatus = "published" | "pending" | "spam";

export type PublicComment = {
  id: string;
  parentId: string | null;
  name: string;
  body: string;
  createdAt: string;
  helpfulCount: number;
  linkRel: CommentLinkRel | null;
};

export type CommentsListResponse = {
  items: PublicComment[];
  nextCursor: string | null;
};

export type CreateCommentRequest = {
  articleId: string;
  name: string;
  body: string;
  parentId?: string | null;
  turnstileToken: string;
};

export type CreateCommentResponse =
  | {
      status: "published";
      comment: PublicComment;
    }
  | {
      status: "pending" | "spam";
      message: string;
    };

export type ModerateCommentRequest = {
  status?: CommentStatus;
  reportsCount?: number;
  helpfulCount?: number;
  linkRel?: CommentLinkRel | null;
};

export type AdminComment = PublicComment & {
  articleId: string;
  status: CommentStatus;
  reportsCount: number;
  moderationReason: string | null;
};

export type AdminCommentsResponse = {
  items: AdminComment[];
  nextCursor: string | null;
};
