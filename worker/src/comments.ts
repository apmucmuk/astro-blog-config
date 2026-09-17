import {
  ApiError,
  assertStrictObject,
  requireIntegerInRange,
  requireNonEmptyString,
  type CommentLinkRel,
  type CommentStatus,
  type CommentsListResponse,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type ModerateCommentRequest,
  type PublicComment,
} from "../../src/core/api";
import { ensureArticleStats, assertRuntimeArticleEnabled } from "./d1";
import { verifyTurnstile } from "./turnstile";
import type { D1Database, Env } from "./types";

const urlPattern = /https?:\/\/[^\s<>"']+/gi;
const idPattern = /^[A-Za-z0-9_-]{1,80}$/;
const linkRelValues = new Set(["dofollow", "nofollow", "sponsored"]);

type CommentRow = {
  id: string;
  site_id: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  status: CommentStatus;
  moderation_reason: string | null;
  reports_count: number;
  helpful_count: number;
  link_rel: CommentLinkRel | null;
  created_at_ms: number;
};

type Cursor = {
  createdAtMs: number;
  id: string;
};

const createCommentSchema = {
  keys: ["articleId", "name", "body", "parentId", "turnstileToken"],
  parse(value: Record<string, unknown>): CreateCommentRequest | { field: string; message: string }[] {
    const errors = [];
    const articleId = requireNonEmptyString(value.articleId, "articleId");
    const name = requireNonEmptyString(value.name, "name");
    const body = requireNonEmptyString(value.body, "body");
    const token = requireNonEmptyString(value.turnstileToken, "turnstileToken");
    const parentId =
      value.parentId === undefined || value.parentId === null ? null : requireNonEmptyString(value.parentId, "parentId");
    for (const result of [articleId, name, body, token, parentId]) {
      if (typeof result === "object" && result !== null) {
        errors.push(result);
      }
    }
    if (errors.length > 0) {
      return errors;
    }
    return {
      articleId: articleId as string,
      name: name as string,
      body: body as string,
      turnstileToken: token as string,
      ...(parentId ? { parentId: parentId as string } : {}),
    };
  },
} as const;

const moderateCommentSchema = {
  keys: ["status", "reportsCount", "helpfulCount", "linkRel"],
  parse(value: Record<string, unknown>): ModerateCommentRequest | { field: string; message: string }[] {
    const errors = [];
    if (value.status !== undefined && !["published", "pending", "spam"].includes(String(value.status))) {
      errors.push({ field: "status", message: "Expected published, pending or spam." });
    }
    const reportsCount =
      value.reportsCount === undefined ? undefined : requireIntegerInRange(value.reportsCount, "reportsCount", 0, 1_000_000);
    const helpfulCount =
      value.helpfulCount === undefined ? undefined : requireIntegerInRange(value.helpfulCount, "helpfulCount", 0, 1_000_000);
    for (const result of [reportsCount, helpfulCount]) {
      if (typeof result === "object" && result !== null) {
        errors.push(result);
      }
    }
    if (value.linkRel !== undefined && value.linkRel !== null && !linkRelValues.has(String(value.linkRel))) {
      errors.push({ field: "linkRel", message: "Expected dofollow, nofollow, sponsored or null." });
    }
    if (errors.length > 0) {
      return errors;
    }
    return {
      ...(value.status !== undefined ? { status: value.status as CommentStatus } : {}),
      ...(reportsCount !== undefined && typeof reportsCount === "number" ? { reportsCount } : {}),
      ...(helpfulCount !== undefined && typeof helpfulCount === "number" ? { helpfulCount } : {}),
      ...(value.linkRel !== undefined ? { linkRel: value.linkRel as CommentLinkRel | null } : {}),
    };
  },
} as const;

export function parseCreateCommentRequest(value: unknown): CreateCommentRequest {
  const parsed = assertStrictObject(value, createCommentSchema);
  const fields = [];
  if (parsed.name.trim().length > 40) {
    fields.push({ field: "name", message: "Name must be at most 40 characters." });
  }
  if (parsed.body.trim().length > 1500) {
    fields.push({ field: "body", message: "Body must be at most 1500 characters." });
  }
  if (parsed.parentId && !idPattern.test(parsed.parentId)) {
    fields.push({ field: "parentId", message: "Invalid parentId." });
  }
  if (!idPattern.test(parsed.articleId)) {
    fields.push({ field: "articleId", message: "Invalid articleId." });
  }
  if (fields.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body failed validation.", fields);
  }
  return { ...parsed, name: parsed.name.trim(), body: parsed.body.trim() };
}

export function parseModerateCommentRequest(value: unknown): ModerateCommentRequest {
  return assertStrictObject(value, moderateCommentSchema);
}

function countLinks(body: string): number {
  return [...body.matchAll(urlPattern)].length;
}

function classifyComment(body: string): Pick<CommentRow, "status" | "moderation_reason" | "link_rel"> {
  const links = countLinks(body);
  if (/\b(?:viagra|casino|crypto bonus)\b/i.test(body)) {
    return { status: "spam", moderation_reason: "spam_pattern", link_rel: null };
  }
  if (links === 0) {
    return { status: "published", moderation_reason: null, link_rel: null };
  }
  return { status: "pending", moderation_reason: "link", link_rel: null };
}

function createCommentId(): string {
  return `c_${crypto.randomUUID().replaceAll("-", "")}`;
}

function encodeCursor(cursor: Cursor): string {
  return btoa(JSON.stringify(cursor));
}

function decodeCursor(value: string | null): Cursor | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(atob(value)) as Cursor;
    if (Number.isSafeInteger(parsed.createdAtMs) && idPattern.test(parsed.id)) {
      return parsed;
    }
  } catch {
    // handled below
  }
  throw new ApiError(400, "BAD_REQUEST", "Invalid cursor.");
}

function parseExcludeIds(value: string | null): string[] {
  if (!value) {
    return [];
  }
  const ids = value.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length > 5 || ids.some((id) => !idPattern.test(id))) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid excludeIds.");
  }
  return ids;
}

export function mapPublicComment(row: CommentRow): PublicComment {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.author_name,
    body: row.body,
    createdAt: new Date(row.created_at_ms).toISOString(),
    helpfulCount: row.helpful_count,
    linkRel: row.link_rel,
  };
}

async function getComment(db: D1Database, id: string): Promise<CommentRow | null> {
  return db
    .prepare(
      `SELECT id, site_id, article_id, parent_id, author_name, body, status, moderation_reason,
              reports_count, helpful_count, link_rel, created_at_ms
       FROM comments
       WHERE id = ?`,
    )
    .bind(id)
    .first<CommentRow>();
}

async function resolveRootParent(db: D1Database, siteId: string, articleId: string, parentId?: string | null): Promise<string | null> {
  if (!parentId) {
    return null;
  }
  const parent = await getComment(db, parentId);
  if (!parent || parent.site_id !== siteId || parent.article_id !== articleId || parent.status !== "published") {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid parent comment.", [
      { field: "parentId", message: "Parent comment is not available." },
    ]);
  }
  return parent.parent_id ?? parent.id;
}

export async function listComments(db: D1Database, env: Env, url: URL): Promise<CommentsListResponse> {
  const articleId = url.searchParams.get("articleId");
  if (!articleId || !idPattern.test(articleId)) {
    throw new ApiError(400, "BAD_REQUEST", "articleId is required.");
  }
  await ensureArticleStats(db, env.SITE_ID, articleId);
  const limit = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 20);
  const cursor = decodeCursor(url.searchParams.get("cursor"));
  const excludeIds = parseExcludeIds(url.searchParams.get("excludeIds"));
  const excludeClause = excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.map(() => "?").join(", ")})` : "";
  const cursorClause = cursor ? "AND (created_at_ms < ? OR (created_at_ms = ? AND id < ?))" : "";
  const params: unknown[] = [env.SITE_ID, articleId, ...excludeIds];
  if (cursor) {
    params.push(cursor.createdAtMs, cursor.createdAtMs, cursor.id);
  }
  params.push(limit + 1);
  const result = await db
    .prepare(
      `SELECT id, site_id, article_id, parent_id, author_name, body, status, moderation_reason,
              reports_count, helpful_count, link_rel, created_at_ms
       FROM comments
       WHERE site_id = ? AND article_id = ? AND status = 'published'
       ${excludeClause}
       ${cursorClause}
       ORDER BY created_at_ms DESC, id DESC
       LIMIT ?`,
    )
    .bind(...params)
    .all<CommentRow>();
  const rows = result.results ?? [];
  const items = rows.slice(0, limit).map(mapPublicComment);
  const last = rows.length > limit ? rows[limit - 1] : null;
  return {
    items,
    nextCursor: last ? encodeCursor({ createdAtMs: last.created_at_ms, id: last.id }) : null,
  };
}

export async function createComment(db: D1Database, env: Env, request: CreateCommentRequest, nowMs = Date.now()): Promise<CreateCommentResponse> {
  await assertRuntimeArticleEnabled(db, env.SITE_ID, request.articleId);
  await verifyTurnstile(request.turnstileToken, env);
  await ensureArticleStats(db, env.SITE_ID, request.articleId, nowMs);
  const parentId = await resolveRootParent(db, env.SITE_ID, request.articleId, request.parentId);
  const classification = classifyComment(request.body);
  const id = createCommentId();
  const result = await db
    .prepare(
      `INSERT INTO comments (
        id, site_id, article_id, parent_id, author_name, body, status,
        moderation_reason, reports_count, helpful_count, link_rel, created_at_ms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
    )
    .bind(
      id,
      env.SITE_ID,
      request.articleId,
      parentId,
      request.name,
      request.body,
      classification.status,
      classification.moderation_reason,
      classification.link_rel,
      nowMs,
    )
    .run();
  if (!result.success) {
    throw new ApiError(500, "INTERNAL_ERROR", "Comment mutation failed.");
  }
  if (classification.status !== "published") {
    return { status: classification.status, message: "Komentarz został wysłany do sprawdzenia." };
  }
  const row = await getComment(db, id);
  if (!row) {
    throw new ApiError(500, "INTERNAL_ERROR", "Created comment is missing.");
  }
  return { status: "published", comment: mapPublicComment(row) };
}

function validatePublishInvariant(row: CommentRow, patch: ModerateCommentRequest): void {
  const status = patch.status ?? row.status;
  const linkRel = patch.linkRel !== undefined ? patch.linkRel : row.link_rel;
  const links = countLinks(row.body);
  if (status !== "published") {
    return;
  }
  if (links === 0 && linkRel !== null) {
    throw new ApiError(400, "VALIDATION_ERROR", "linkRel must be null without links.");
  }
  if (links === 1 && !linkRel) {
    throw new ApiError(400, "VALIDATION_ERROR", "linkRel is required for a published comment with one link.");
  }
  if (links > 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Comments with multiple links cannot be published in v1.");
  }
}

export async function moderateComment(db: D1Database, id: string, patch: ModerateCommentRequest): Promise<CommentRow> {
  const existing = await getComment(db, id);
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Comment not found.");
  }
  validatePublishInvariant(existing, patch);
  const next = {
    status: patch.status ?? existing.status,
    reportsCount: patch.reportsCount ?? existing.reports_count,
    helpfulCount: patch.helpfulCount ?? existing.helpful_count,
    linkRel: patch.linkRel !== undefined ? patch.linkRel : existing.link_rel,
  };
  await db
    .prepare(
      `UPDATE comments
       SET status = ?, reports_count = ?, helpful_count = ?, link_rel = ?
       WHERE id = ?`,
    )
    .bind(next.status, next.reportsCount, next.helpfulCount, next.linkRel, id)
    .run();
  const updated = await getComment(db, id);
  if (!updated) {
    throw new ApiError(500, "INTERNAL_ERROR", "Updated comment is missing.");
  }
  return updated;
}

export async function deleteComment(db: D1Database, id: string): Promise<void> {
  await db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
}

export async function markHelpful(db: D1Database, id: string): Promise<PublicComment> {
  await db.prepare("UPDATE comments SET helpful_count = helpful_count + 1 WHERE id = ? AND status = 'published'").bind(id).run();
  const row = await getComment(db, id);
  if (!row || row.status !== "published") {
    throw new ApiError(404, "NOT_FOUND", "Comment not found.");
  }
  return mapPublicComment(row);
}

export async function reportComment(db: D1Database, id: string): Promise<{ status: "reported" }> {
  const row = await getComment(db, id);
  if (!row || row.status !== "published") {
    throw new ApiError(404, "NOT_FOUND", "Comment not found.");
  }
  await db.prepare("UPDATE comments SET reports_count = reports_count + 1 WHERE id = ? AND status = 'published'").bind(id).run();
  return { status: "reported" };
}
