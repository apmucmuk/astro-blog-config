type AdminApiContext = {
  request: Request;
  env: {
    ADMIN_API: {
      fetch(request: Request): Promise<Response>;
    };
  };
};

export async function onRequest(context: AdminApiContext): Promise<Response> {
  if (!context.request.headers.has("CF-Access-Jwt-Assertion")) {
    return new Response("Admin authentication is required.", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return context.env.ADMIN_API.fetch(context.request);
}
