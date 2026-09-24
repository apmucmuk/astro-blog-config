import { describe, expect, it, vi } from "vitest";
import { onRequest } from "./[[path]]";

describe("admin Pages API proxy", () => {
  it("fails closed without an Access assertion", async () => {
    const fetch = vi.fn();

    const response = await onRequest({
      request: new Request("https://preview.example/admin/api/comments?status=pending"),
      env: { ADMIN_API: { fetch } },
    });

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards the original authenticated request only through the fixed binding", async () => {
    const upstream = new Response('{"items":[]}', { headers: { "Content-Type": "application/json" } });
    const fetch = vi.fn(async (_request: Request) => upstream);
    const request = new Request("https://preview.example/admin/api/comments/comment-1", {
      method: "PATCH",
      headers: {
        "CF-Access-Jwt-Assertion": "assertion",
        "Content-Type": "application/json",
      },
      body: '{"status":"published"}',
    });

    const response = await onRequest({ request, env: { ADMIN_API: { fetch } } });

    expect(response).toBe(upstream);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(request);
  });
});
