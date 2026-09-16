import { ApiError, toApiErrorBody } from "../../src/core/api";
import type { Env } from "./types";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
} as const;

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {}),
    },
  });
}

export function mutationJsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return jsonResponse(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

export function apiErrorResponse(error: unknown, mutation = false): Response {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, "INTERNAL_ERROR", "Internal server error.");
  const response = mutation ? mutationJsonResponse : jsonResponse;

  return response(toApiErrorBody(apiError), { status: apiError.status });
}

export function withCors(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== env.ALLOWED_ORIGIN) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.append("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function corsPreflight(request: Request, env: Env): Response {
  const origin = request.headers.get("Origin");
  if (origin !== env.ALLOWED_ORIGIN) {
    return apiErrorResponse(new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed."), true);
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    },
  });
}

export function requireMutationOrigin(request: Request, env: Env): void {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== env.ALLOWED_ORIGIN) {
    throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed.");
  }
}
