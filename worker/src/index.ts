import { ApiError, type HealthResponse } from "../../src/core/api";
import {
  createComment,
  deleteComment,
  listAdminComments,
  listComments,
  markHelpful,
  moderateComment,
  parseCreateCommentRequest,
  parseModerateCommentRequest,
  reportComment,
  purgeSpamComments,
} from "./comments";
import { parseRatingRequest, getRating, submitRating } from "./rating";
import {
  apiErrorResponse,
  corsPreflight,
  jsonResponse,
  mutationJsonResponse,
  privateJsonResponse,
  requireMutationOrigin,
  withCors,
} from "./responses";
import type { Env } from "./types";
import { parseReadInput } from "../../src/core/api/reads";
import { recordRead } from "./reads";
import { statsResponse } from "./stats-cache";
import { requireReadCapacity } from "./read-limit";
import { requireAccess } from "./access";
import { getOptionalVisitorIdentity, getOrCreateVisitorIdentity } from "./visitor";

function isMutation(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

function health(env: Env): Response {
  const body: HealthResponse = {
    ok: true,
    service: "tragarze-api",
    environment: env.APP_ENV,
  };

  return jsonResponse(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function methodNotAllowed(mutation: boolean): Response {
  const error = new ApiError(405, "METHOD_NOT_ALLOWED", "Method is not allowed.");
  return mutation ? apiErrorResponse(error, true) : apiErrorResponse(error);
}

function articleRatingMatch(pathname: string): string | null {
  const match = pathname.match(/^\/v1\/articles\/([^/]+)\/rating$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function commentActionMatch(pathname: string, action: "helpful" | "report"): string | null {
  const match = pathname.match(new RegExp(`^/v1/comments/([^/]+)/${action}$`));
  return match ? decodeURIComponent(match[1]) : null;
}

function adminCommentMatch(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/api\/comments\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function enforceRatingRateLimitPath(env: Env): void {
  if (env.RATE_LIMIT_RATINGS === "0") {
    throw new ApiError(429, "RATE_LIMITED", "Rating rate limit exceeded.");
  }
}

async function readStrictJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected application/json request body.");
  }

  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Malformed JSON request body.");
  }
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return corsPreflight(request, env);
  }

  const mutation = isMutation(request.method);
  if (mutation) {
    requireMutationOrigin(request, env);
  }

  if (url.pathname.startsWith("/admin/")) {
    await requireAccess(request, env);
  }

  if (url.pathname === "/health") {
    return request.method === "GET" || request.method === "HEAD" ? health(env) : methodNotAllowed(mutation);
  }

  if (url.pathname === "/v1/stats") {
    return request.method === "GET"
      ? await statsResponse(request, env)
      : methodNotAllowed(mutation);
  }

  if (url.pathname === "/v1/read") {
    if (request.method !== "POST") return methodNotAllowed(true);
    const input = parseReadInput(await readStrictJson(request));
    const visitor = getOrCreateVisitorIdentity(request, env);
    await requireReadCapacity(env, visitor.visitorId!, input.articleId);
    const response = mutationJsonResponse(await recordRead(env.DB, env.SITE_ID, input.articleId));
    if (visitor.setCookie) response.headers.set("Set-Cookie", visitor.setCookie);
    return response;
  }

  if (url.pathname === "/v1/comments") {
    if (request.method === "GET") {
      return jsonResponse(await listComments(env.DB, env, url));
    }
    if (request.method === "POST") {
      if (env.RATE_LIMIT_COMMENTS === "0") {
        throw new ApiError(429, "RATE_LIMITED", "Comment rate limit exceeded.");
      }
      return mutationJsonResponse(await createComment(env.DB, env, parseCreateCommentRequest(await readStrictJson(request))));
    }
    return methodNotAllowed(mutation);
  }

  const helpfulCommentId = commentActionMatch(url.pathname, "helpful");
  if (helpfulCommentId) {
    return request.method === "POST" ? mutationJsonResponse(await markHelpful(env.DB, helpfulCommentId)) : methodNotAllowed(mutation);
  }

  const reportCommentId = commentActionMatch(url.pathname, "report");
  if (reportCommentId) {
    return request.method === "POST" ? mutationJsonResponse(await reportComment(env.DB, reportCommentId)) : methodNotAllowed(mutation);
  }

  const adminCommentId = adminCommentMatch(url.pathname);
  if (url.pathname === "/admin/api/comments") {
    return request.method === "GET" ? jsonResponse(await listAdminComments(env.DB, env, url), { headers: { "Cache-Control": "no-store" } }) : methodNotAllowed(mutation);
  }

  if (url.pathname === "/admin/api/comments/spam/purge") {
    return request.method === "POST" ? mutationJsonResponse(await purgeSpamComments(env.DB, env.SITE_ID)) : methodNotAllowed(mutation);
  }

  if (adminCommentId) {
    if (request.method === "PATCH") {
      return mutationJsonResponse(await moderateComment(env.DB, adminCommentId, parseModerateCommentRequest(await readStrictJson(request))));
    }
    if (request.method === "DELETE") {
      await deleteComment(env.DB, adminCommentId);
      return mutationJsonResponse({ status: "deleted" });
    }
    return methodNotAllowed(mutation);
  }

  const ratingArticleId = articleRatingMatch(url.pathname);
  if (ratingArticleId) {
    if (request.method === "GET") {
      const visitor = getOptionalVisitorIdentity(request, env);
      return privateJsonResponse(await getRating(env.DB, env.SITE_ID, ratingArticleId, visitor.visitorId));
    }

    if (request.method === "POST") {
      enforceRatingRateLimitPath(env);
      const visitor = getOrCreateVisitorIdentity(request, env);
      const body = parseRatingRequest(await readStrictJson(request));
      const response = mutationJsonResponse(
        await submitRating(env.DB, env.SITE_ID, ratingArticleId, visitor.visitorId ?? "", body.value),
      );
      if (visitor.setCookie) {
        response.headers.set("Set-Cookie", visitor.setCookie);
      }
      return response;
    }

    return methodNotAllowed(mutation);
  }

  const notFound = new ApiError(404, "NOT_FOUND", "Route not found.");
  return mutation ? mutationJsonResponse({ error: { code: notFound.code, message: notFound.message } }, { status: 404 }) : apiErrorResponse(notFound);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return withCors(await handleRequest(request, env), request, env);
    } catch (error) {
      const isAdmin = new URL(request.url).pathname.startsWith("/admin/");
      return withCors(apiErrorResponse(error, isMutation(request.method) || isAdmin), request, env);
    }
  },
};
