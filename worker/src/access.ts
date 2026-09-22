import { ApiError } from "../../src/core/api";
import type { Env } from "./types";

type AccessHeader = { alg: string; kid: string; typ?: string };
type AccessClaims = { iss: string; aud: string | string[]; exp: number; nbf?: number; sub?: string; email?: string };
type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };
type Jwks = { keys: Jwk[] };

const cache = new Map<string, { expiresAt: number; keys: Jwk[] }>();

function decodePart<T>(part: string): T {
  try {
    const padded = part.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((part.length + 3) % 4);
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (value) => value.charCodeAt(0)))) as T;
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  }
}

export async function requireAccess(request: Request, env: Env, now = Date.now(), fetcher: typeof fetch = fetch): Promise<AccessClaims> {
  const token = request.headers.get("CF-Access-Jwt-Assertion");
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is required.");
  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
    throw new ApiError(503, "ACCESS_UNAVAILABLE", "Admin authentication is unavailable.");
  }
  const parts = token.split(".");
  if (parts.length !== 3) throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  const header = decodePart<AccessHeader>(parts[0]);
  const claims = decodePart<AccessClaims>(parts[1]);
  const team = env.CF_ACCESS_TEAM_DOMAIN.replace(/^https:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9.-]+$/i.test(team) || header.alg !== "RS256" || !header.kid) throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  const issuer = `https://${team}`;
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== issuer || !audience.includes(env.CF_ACCESS_AUD) || !Number.isFinite(claims.exp) || claims.exp * 1000 <= now || (claims.nbf !== undefined && claims.nbf * 1000 > now)) {
    throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  }
  let keys = cache.get(issuer);
  if (!keys || keys.expiresAt <= now) {
    try {
      const response = await fetcher(`${issuer}/cdn-cgi/access/certs`);
      if (!response.ok) throw new Error("JWKS unavailable");
      const body = await response.json() as Jwks;
      if (!Array.isArray(body.keys)) throw new Error("Invalid JWKS");
      keys = { keys: body.keys, expiresAt: now + 3600000 };
      cache.set(issuer, keys);
    } catch {
      throw new ApiError(503, "ACCESS_UNAVAILABLE", "Admin authentication is unavailable.");
    }
  }
  const key = keys.keys.find((candidate) => candidate.kid === header.kid && candidate.kty === "RSA" && candidate.alg === "RS256");
  if (!key) throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  try {
    const imported = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(atob(parts[2].replaceAll("-", "+").replaceAll("_", "/")), (value) => value.charCodeAt(0));
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", imported, signature, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) throw new Error("Invalid signature");
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "Admin authentication is invalid.");
  }
  return claims;
}
