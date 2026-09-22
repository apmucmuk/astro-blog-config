import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAccess } from "./access";
import worker from "./index";
import type { Env } from "./types";

const encoder = new TextEncoder();
const base64url = (value: Uint8Array | string) => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let text = ""; for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
async function signedToken(team: string, aud: string, claims: Record<string, unknown> = {}) {
  const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const header = base64url(JSON.stringify({ alg: "RS256", kid: "test-key", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iss: `https://${team}`, aud, exp: Math.floor(Date.now() / 1000) + 3600, ...claims }));
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, encoder.encode(`${header}.${payload}`)));
  return { token: `${header}.${payload}.${base64url(signature)}`, jwk: { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "test-key", alg: "RS256", use: "sig" } };
}
function env(team = "team-unique.cloudflareaccess.com"): Env {
  return { APP_ENV: "development", SITE_ID: "tragarze-pl", ALLOWED_ORIGIN: "https://tragarze.pl", POPULARITY_WINDOW_DAYS: "7", VISITOR_COOKIE_NAME: "tragarze_vid", CF_ACCESS_TEAM_DOMAIN: team, CF_ACCESS_AUD: "audience", DB: { prepare() { throw new Error("no database"); } } };
}

describe("Cloudflare Access boundary", () => {
  beforeEach(() => vi.unstubAllGlobals());
  it("verifies signed RS256 assertion, issuer, audience and expiry", async () => {
    const local = env(); const { token, jwk } = await signedToken(local.CF_ACCESS_TEAM_DOMAIN!, local.CF_ACCESS_AUD!);
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ keys: [jwk] })));
    await expect(requireAccess(new Request("https://api.test/admin/api/comments", { headers: { "CF-Access-Jwt-Assertion": token } }), local, Date.now(), fetcher)).resolves.toMatchObject({ aud: "audience" });
    expect(fetcher).toHaveBeenCalledWith(`https://${local.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
  });
  it("rejects missing, malformed, expired, wrong audience/issuer and tampered assertions", async () => {
    const local = env("team-invalid.cloudflareaccess.com"); const { token, jwk } = await signedToken(local.CF_ACCESS_TEAM_DOMAIN!, local.CF_ACCESS_AUD!);
    const fetcher = async () => new Response(JSON.stringify({ keys: [jwk] }));
    await expect(requireAccess(new Request("https://api.test/admin"), local, Date.now(), fetcher)).rejects.toMatchObject({ status: 401 });
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": "a.b.c" } }), local, Date.now(), fetcher)).rejects.toMatchObject({ status: 401 });
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1].slice(0, -1)}${parts[1].endsWith("a") ? "b" : "a"}.${parts[2]}`;
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": tampered } }), local, Date.now(), fetcher)).rejects.toMatchObject({ status: 401 });
    const expired = await signedToken(local.CF_ACCESS_TEAM_DOMAIN!, local.CF_ACCESS_AUD!, { exp: 1 });
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": expired.token } }), local, Date.now(), async () => new Response(JSON.stringify({ keys: [expired.jwk] })))).rejects.toMatchObject({ status: 401 });
    const wrongAud = await signedToken(local.CF_ACCESS_TEAM_DOMAIN!, "wrong");
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": wrongAud.token } }), local, Date.now(), async () => new Response(JSON.stringify({ keys: [wrongAud.jwk] })))).rejects.toMatchObject({ status: 401 });
  });
  it("fails closed if Access configuration or JWKS is unavailable", async () => {
    const local = env("team-unavailable.cloudflareaccess.com"); const { token } = await signedToken(local.CF_ACCESS_TEAM_DOMAIN!, local.CF_ACCESS_AUD!);
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": token } }), { ...local, CF_ACCESS_AUD: undefined }, Date.now(), fetch)).rejects.toMatchObject({ status: 503 });
    await expect(requireAccess(new Request("https://api.test/admin", { headers: { "CF-Access-Jwt-Assertion": token } }), local, Date.now(), async () => { throw new Error("offline"); })).rejects.toMatchObject({ status: 503 });
  });
  it("protects the actual admin API before D1 access and keeps mutation errors no-store", async () => {
    const local = env("team-route.cloudflareaccess.com");
    const get = await worker.fetch(new Request("https://api.test/admin/api/comments"), local);
    expect(get.status).toBe(401); expect(get.headers.get("Cache-Control")).toBe("no-store");
    const patch = await worker.fetch(new Request("https://api.test/admin/api/comments/c_x", { method: "PATCH", headers: { Origin: "https://tragarze.pl", "Content-Type": "application/json" }, body: "{}" }), local);
    expect(patch.status).toBe(401); expect(patch.headers.get("Cache-Control")).toBe("no-store");
  });
});
