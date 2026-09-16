import { ApiError } from "../../src/core/api";
import type { Env } from "./types";

const visitorIdPattern = /^vid_[a-f0-9]{32}$/;

function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name || rest.length === 0) {
      continue;
    }
    cookies.set(name, rest.join("="));
  }

  return cookies;
}

function createVisitorId(): string {
  return `vid_${crypto.randomUUID().replaceAll("-", "")}`;
}

function assertVisitorId(value: string): string {
  if (!visitorIdPattern.test(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Visitor identity is invalid.", [
      { field: "visitor", message: "Visitor identity cookie is malformed." },
    ]);
  }

  return value;
}

export type VisitorIdentity = {
  visitorId: string | null;
  setCookie?: string;
};

export function getOptionalVisitorIdentity(request: Request, env: Env): VisitorIdentity {
  const value = parseCookies(request.headers.get("Cookie")).get(env.VISITOR_COOKIE_NAME);
  return { visitorId: value ? assertVisitorId(value) : null };
}

export function getOrCreateVisitorIdentity(request: Request, env: Env): VisitorIdentity {
  const existing = getOptionalVisitorIdentity(request, env);
  if (existing.visitorId) {
    return existing;
  }

  const visitorId = createVisitorId();
  return {
    visitorId,
    setCookie: `${env.VISITOR_COOKIE_NAME}=${visitorId}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  };
}
