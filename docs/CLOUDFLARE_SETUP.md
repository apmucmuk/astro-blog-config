# CLOUDFLARE_SETUP.md

Operational setup contract for the Astro starter / tragarze.pl runtime.
Architecture and API semantics remain authoritative in `SPEC.md`.

## 1. Cloudflare components

Use:
- Cloudflare Pages (or equivalent static hosting) for generated Astro output;
- Cloudflare Workers for `/v1/...` runtime API;
- D1 for runtime registry, article stats, daily read buckets, comments and rating votes;
- Turnstile for public mutation forms where required;
- Cloudflare Access for admin endpoints/UI.

Default topology:
```text
https://tragarze.pl        -> static site
https://api.tragarze.pl    -> Worker API
```
Same-origin `/api` is optional only when deliberately routed through an adapter/proxy.

## 2. Environments

Maintain at least `preview` and `production`. Preview must not become indexable production content. Keep D1 databases/secrets isolated by environment where practical.

Never store secrets in repository files or generated static HTML.

## 3. D1

Create D1 databases and apply only versioned migrations. No manual production schema edits.
Canonical tables are defined in SPEC, including:
- `content_articles`
- `article_stats`
- `article_read_daily`
- `comments`
- `article_rating_votes`

Back up before destructive migrations. Test restore in non-production once runtime data matters.

## 4. Runtime registry deployment order

For a new article:
```text
validate/build
-> sync runtime content registry
-> deploy static page
-> verify public page + runtime API
```

For removal:
```text
publish/verify redirect, 404 or 410
-> disable old runtime article
-> retain runtime rows until explicit maintenance purge
```

Slug changes retain stable article ID and runtime data.

## 5. Worker bindings / variables

Worker must receive environment bindings rather than hard-coded IDs/secrets. Exact names are mirrored in `.env.example` / deployment config.

Expected categories:
- environment/site identity;
- allowed public origin;
- D1 binding;
- Turnstile secret/site key split as appropriate;
- Access audience/team-domain or equivalent verification configuration;
- rate-limit configuration;
- popularity window.

## 6. CORS and cookies

For credentialed browser requests from production site:
```text
Access-Control-Allow-Origin: https://tragarze.pl
Access-Control-Allow-Credentials: true
Vary: Origin
```
Never use `*` with credentials.

Visitor cookie is host-only to API host, `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax` unless a tested deployment topology requires a documented change.

Worker derives `site_id` from trusted deployment/origin mapping, never from arbitrary browser JSON.

## 7. Origin / mutation security

Browser mutation requests with missing or invalid Origin are rejected by default. Use exact allowlists.

Admin endpoints require Cloudflare Access identity verification plus allowed Origin, expected Content-Type and runtime validation. Do not treat the presence of an Access header as sufficient; validate issuer/audience/signature/expiry according to the chosen Access JWT mechanism.

## 8. Turnstile

Use separate production/test configuration. Local/CI tests must use documented Turnstile test keys or mocked boundary adapters; never put production secrets into test fixtures.

Backend verification is authoritative. Frontend success alone never authorizes a mutation.

## 9. Rate limiting

Implement resource-specific Worker rate limits for public mutations and read counting. Rate limiting is abuse mitigation, not identity. Do not persist raw IPs in application tables.

Initial numeric thresholds are deployment configuration and should be conservative, observable and adjustable without schema changes.

## 10. Atomic D1 mutations

Where a source mutation changes an aggregate, update them in one D1 transaction/batch strategy supported by the deployed runtime. Examples:
- accepted qualified read -> all-time stats + daily bucket;
- rating create/change -> vote row + rating aggregate delta;
- comment moderation state transition -> comment status + comments_count delta.

Do not perform aggregate transitions as unrelated best-effort requests.

## 11. Logs

Use structured provider-native logs. Never log:
- Authorization/Access JWTs;
- full visitor cookies;
- Turnstile tokens;
- comment bodies;
- full admin payloads;
- raw SQL values containing user content;
- raw IPs as persistent application telemetry.

Log request IDs, route, status, duration, coarse error code and safe identifiers where needed.

## 12. CI/CD baseline

Pull request / pre-deploy checks:
```text
install from lockfile
-> typecheck
-> content/schema validation
-> unit tests
-> Astro build
-> link/route validation
-> Playwright smoke tests where environment permits
```

Production deploy should fail closed on build/content validation errors.

D1 migrations and registry sync must be explicit deployment stages, not hidden side effects of a page request.

## 13. Domains / DNS

Production values are not to be invented. When the user confirms domains, configure DNS/TLS for the site and API host, then update exact-origin allowlists and environment config.

## 14. Health / verification

Expose an unversioned `/health` endpoint with no secrets and no database dump. Deployment verification should check:
- static homepage/content route;
- API health;
- registry lookup for a known published article;
- read endpoint behavior;
- comments/rating read path;
- admin protection.

## 15. Rollback

Static deployment rollback and Worker rollback must be possible independently. Database migrations require a forward/rollback plan appropriate to the migration; do not assume code rollback can undo destructive D1 changes.
