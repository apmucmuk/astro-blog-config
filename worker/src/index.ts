import { ApiError, type HealthResponse } from "../../src/core/api";
import { apiErrorResponse, corsPreflight, jsonResponse, mutationJsonResponse, requireMutationOrigin, withCors } from "./responses";
import type { Env } from "./types";

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

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return corsPreflight(request, env);
  }

  const mutation = isMutation(request.method);
  if (mutation) {
    requireMutationOrigin(request, env);
  }

  if (url.pathname === "/health") {
    return request.method === "GET" || request.method === "HEAD" ? health(env) : methodNotAllowed(mutation);
  }

  if (url.pathname === "/v1/stats") {
    return request.method === "GET"
      ? jsonResponse({ generatedAt: new Date(0).toISOString(), articles: [], rankings: {} })
      : methodNotAllowed(mutation);
  }

  const notFound = new ApiError(404, "NOT_FOUND", "Route not found.");
  return mutation ? mutationJsonResponse({ error: { code: notFound.code, message: notFound.message } }, { status: 404 }) : apiErrorResponse(notFound);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return withCors(await handleRequest(request, env), request, env);
    } catch (error) {
      return withCors(apiErrorResponse(error, isMutation(request.method)), request, env);
    }
  },
};
