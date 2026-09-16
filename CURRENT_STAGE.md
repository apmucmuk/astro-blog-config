# CURRENT_STAGE.md

## Purpose
Factual implementation status for the active project. This file records what has actually been implemented and verified. It does not define architecture.

## Active project
`tragarze.pl`

## Current stage
Stage 7 - Comments.

## Status
`complete`

Stage 7 implementation has been verified locally in the repository branch `codex/stage-7-comments`.

## Verified checks
### Stage 7
- 2026-09-16 23:17 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile is current. pnpm printed a non-fatal update metadata network warning but exited 0.
- 2026-09-16 23:16 +02:00 - `pnpm worker:validate` - PASS. Worker/D1 foundation validation remains valid and now verifies the Stage 7 comments_count trigger migration.
- 2026-09-16 23:16 +02:00 - `pnpm test` - PASS. Vitest reported 7 test files passed and 37 tests passed, including 0/1/2+ link classification, body limit, malformed payload, missing/disabled article rejection, Turnstile success/failure/no-write boundary, comments_count transitions, delete behavior, helpful/report behavior, reply normalization, keyset pagination, featured excludeIds, empty featured exclusions, Origin/CORS/no-store error contract and Stage 6 rating concurrency regressions.
- 2026-09-16 23:16 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed with 0 errors, 0 warnings and 0 hints.
- 2026-09-16 23:16 +02:00 - `pnpm build` - PASS. Production static build still generated accepted Stage 1-6 outputs; comments API failure does not break static article rendering.
- 2026-09-16 23:16 +02:00 - `pnpm seo:validate` - PASS. Stage 1-3 SEO/content behavior regression remained valid.
- 2026-09-16 23:17 +02:00 - `pnpm theme:validate` - PASS. Stage 4 static/theme browser regression remained valid.
- 2026-09-16 23:17 +02:00 - Cloudflare deployed Worker/D1/Turnstile comments verification - BLOCKED by external authorization and unresolved Q005 provisioning details. No production Cloudflare account ID, D1 ID, Turnstile secret, tokens or other secrets were requested or committed.

### Stage 7 implementation notes
- Added versioned migration `worker/migrations/0003_comments_count_triggers.sql`; accepted `0001` and `0002` migrations were not rewritten.
- `comments_count` is maintained by D1 triggers on comments insert/status update/delete, avoiding Worker-side stale read-before-write aggregate deltas.
- Implemented public Comments API: `GET /v1/comments`, `POST /v1/comments`, `POST /v1/comments/{id}/helpful`, `POST /v1/comments/{id}/report`.
- Implemented service-level moderation primitives needed for Stage 7: `PATCH /admin/api/comments/{id}` and `DELETE /admin/api/comments/{id}`. No Stage 9 admin UI or custom auth stack was implemented.
- Added comments DTOs/runtime validation for public comment models, create request, moderation patch and comment status/link rel contracts.
- Added Turnstile boundary in `worker/src/turnstile.ts`: local/mock mode accepts `test-pass`; failure creates no D1 row; production remains fail-closed without configured secret.
- Implemented author/body limits, plain-text body storage, 0-link published, 1-link pending, 2+ link pending/non-publishable invariant, simple spam-pattern classification, reply normalization to root, keyset cursor pagination, max-5 featured `excludeIds`, and empty featured-list handling without `NOT IN ()`.
- Did not implement Stage 8 reads/stats snapshot/popularity, Stage 9 admin UI, or production Cloudflare/Turnstile provisioning.

### Stage 6
- 2026-09-16 23:03 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile is current. pnpm printed a non-fatal update metadata network warning but exited 0.
- 2026-09-16 23:03 +02:00 - `pnpm worker:validate` - PASS. Stage 5 Worker/D1 foundation validation remains valid and now also verifies the Stage 6 rating aggregate trigger migration.
- 2026-09-16 23:02 +02:00 - `pnpm test` - PASS. Vitest reported 6 test files passed and 30 tests passed, including first vote, vote update, same-value repeat, two visitors, concurrent update race, concurrent first-vote race, rating_sum/rating_count correctness, rating 1/5 boundaries, invalid ratings, malformed payload, disabled/missing article, Origin/CORS, no-store, rate-limit path and upsert failure no-desync behavior.
- 2026-09-16 23:03 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed with 0 errors, 0 warnings and 0 hints.
- 2026-09-16 23:03 +02:00 - `pnpm build` - PASS. Production static build still generated accepted Stage 1-5 outputs; rating API failure does not break static article rendering.
- 2026-09-16 23:03 +02:00 - `pnpm seo:validate` - PASS. Stage 1-3 SEO/content behavior regression remained valid; no fake rating/AggregateRating was introduced for zero-count runtime ratings.
- 2026-09-16 23:03 +02:00 - `pnpm theme:validate` - PASS. Stage 4 static/theme browser regression remained valid.
- 2026-09-16 23:03 +02:00 - Cloudflare deployed Worker/D1 rating verification - BLOCKED by external authorization. No production Cloudflare account ID, D1 ID, tokens or secrets were requested or committed.

### Stage 6 implementation notes
- Added shared `RatingRequest` and `RatingResponse` DTOs plus strict integer range validation.
- Implemented `GET /v1/articles/{articleId}/rating` returning private/no-store personalized rating data with `ratingValue`, `ratingCount` and `myRating`.
- Implemented `POST /v1/articles/{articleId}/rating` with strict JSON body validation, exact-Origin mutation protection, first-party anonymous visitor cookie creation/validation and no-store mutation responses/errors.
- Added `worker/src/rating.ts` for first vote, vote update, same-value idempotence, public `ratingValue = rating_sum / rating_count` only when `rating_count > 0`, and no public `ratingScore`.
- Rating mutations validate `content_articles`/runtime-enabled article scope before vote writes. `article_rating_votes` is mutated through one D1 UPSERT and `article_stats.rating_sum/rating_count` is maintained by versioned D1 triggers in `worker/migrations/0002_rating_aggregate_triggers.sql`, avoiding stale read-before-write deltas under concurrent requests.
- Added opaque HttpOnly/Secure/SameSite=Lax/Path=/ visitor cookie handling in `worker/src/visitor.ts`; raw IP/fingerprinting/user account identity is not used.
- Added configurable rating rate-limit rejection path via `RATE_LIMIT_RATINGS=0` for the Stage 6 abuse/rate-limit gate without introducing new storage or future-stage behavior.
- Did not implement Stage 7 comments, Stage 8 reads/stats snapshot ranking, admin, or additional migrations.

### Stage 5
- 2026-09-16 07:08 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile is current.
- 2026-09-16 07:08 +02:00 - `pnpm worker:validate` - PASS. Runtime registry generated 1 published article; versioned D1 migration, canonical tables/indexes, Wrangler local D1 binding, preview/local separation, env names and secret scan passed.
- 2026-09-16 07:08 +02:00 - `pnpm test` - PASS. Vitest reported 5 test files passed and 17 tests passed, including Worker `/health`, credentialed exact-Origin CORS, mutation `no-store` error responses and lazy `article_stats` initialization.
- 2026-09-16 07:08 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed with 0 errors, 0 warnings and 0 hints.
- 2026-09-16 07:08 +02:00 - `pnpm build` - PASS. Production static build still generated accepted Stage 1-4 outputs.
- 2026-09-16 07:08 +02:00 - `pnpm seo:validate` - PASS. Stage 1-3 SEO/content behavior regression remained valid.
- 2026-09-16 07:08 +02:00 - `pnpm theme:validate` - PASS. Stage 4 static/theme browser regression remained valid.
- 2026-09-16 07:08 +02:00 - Cloudflare production D1 creation/migration apply - BLOCKED by external authorization. No production Cloudflare account ID, production D1 database ID or secrets were requested or committed.

### Stage 5 implementation notes
- Added canonical versioned D1 migration `worker/migrations/0001_runtime_foundation.sql` for `content_articles`, `article_stats`, `article_read_daily`, `comments` and `article_rating_votes`, including canonical starter indexes from SPEC section 85.
- Added Worker runtime shell in `worker/src`: `/health`, `/v1/stats` foundation response, shared error response shape, exact-Origin credentialed CORS primitives, mutation Origin rejection and `no-store` mutation/error response handling.
- Added shared CORE API DTO/error/runtime validation primitives in `src/core/api` so Worker handlers do not maintain a divergent copy of shared contracts.
- Added D1 registry/stat helpers with prepared statements and idempotent lazy `article_stats` initialization after `content_articles` runtime-enabled validation.
- Added explicit runtime registry generation via `scripts/generate-runtime-registry.mjs` and committed `worker/registry/content-articles.json`; draft and scheduled content are excluded from runtime-enabled registry rows.
- Added `scripts/validate-worker-foundation.mjs` and package scripts `worker:registry` / `worker:validate`.
- Configured local Worker/D1 baseline in `worker/wrangler.jsonc` with `DB` binding, local development database identity, local preview separation, project/env vars and no production secrets.
- Did not implement Stage 6 rating behavior, Stage 7 comments behavior, Stage 8 read-count mutation behavior or admin features. Future-stage tables exist only because the canonical Stage 5 D1 model requires the shared foundation.

### Stage 4
- 2026-09-16 06:50 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile is current after adding exact `playwright-core` dev dependency.
- 2026-09-16 06:50 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed with 0 errors, 0 warnings and 0 hints.
- 2026-09-16 06:50 +02:00 - `pnpm test` - PASS. Vitest reported 3 test files passed and 10 tests passed.
- 2026-09-16 06:51 +02:00 - `pnpm build` - PASS. Production static build generated article, editorial/person pages, `404.html`, `redirects.json`, `robots.txt`, `rss.xml`, `sitemap.xml` and homepage.
- 2026-09-16 06:51 +02:00 - `pnpm seo:validate` - PASS. Stage 1-3 SEO/content behavior regression remained valid in the production build.
- 2026-09-16 06:51 +02:00 - `pnpm theme:validate` - PASS. Production-build HTML/static inspection and real Chrome browser validation passed for Stage 4 theme gates.

### Stage 4 implementation notes
- Added static-first theme primitives in `src/theme/styles/tokens.css`, `src/theme/styles/global.css` and `src/theme/layouts/BaseLayout.astro`.
- Implemented mobile-first typography, layout, header/navigation, skip link, visible focus states, article presentation, editorial/person presentation and reusable card/list primitives.
- Added light/dark color schemes using system preference defaults.
- Preserved `CORE -> FEATURES -> THEME -> PROJECT` boundaries by keeping project navigation/config outside THEME and passing them into `BaseLayout` as props.
- Kept Stage 4 free of global React/client hydration; production HTML validation confirms no hydrated Astro islands.
- Reserved article hero dimensions and marked the representative LCP image eager/high priority while preserving lazy behavior requirements for non-LCP images.
- Added `scripts/validate-theme-build.mjs` and `scripts/validate-theme-browser.mjs`, exposed through `pnpm theme:validate`.
- During validation, the initial low-level Chrome DevTools Protocol transport timed out at `Runtime.enable`; the browser gate was replaced with `playwright-core` using the installed system Chrome while keeping the same Stage 4 assertions. A too-literal computed `68ch` browser assertion was corrected by moving source-level readable-measure validation into the static CSS check and retaining real viewport overflow/readability checks in Chrome.
- Did not start Stage 5 Worker/D1 work.

### Stage 3
- 2026-09-15 19:01 +02:00 - `pnpm test` - PASS. Vitest reported 3 test files passed and 10 tests passed.
- 2026-09-15 19:01 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed with 0 errors, 0 warnings and 0 hints.
- 2026-09-15 19:01 +02:00 - `pnpm build` - PASS. Production static build generated article, editorial/person pages, `404.html`, `redirects.json`, `robots.txt`, `rss.xml`, `sitemap.xml` and homepage.
- 2026-09-15 19:01 +02:00 - `pnpm seo:validate` - PASS. Production-build HTML/output inspection verified title/description, canonical, hreflang, robots, sitemap/RSS filtering, breadcrumbs JSON-LD, BlogPosting JSON-LD, ProfilePage/Person JSON-LD, 404 noindex/no canonical and redirect manifest output.
- 2026-09-15 19:02 +02:00 - `pnpm preview -- --host 127.0.0.1 --port 4322` plus HTTP probes - PASS. Published article returned 200, unknown URL returned real 404, sitemap returned 200 with XML content type. Preview server was stopped.
- 2026-09-15 19:02 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile is current.
- 2026-09-15 22:59 +02:00 - resumed verification after limit reset - PASS. Re-ran `pnpm test`, `pnpm check`, `pnpm build`, `pnpm seo:validate`, `pnpm install --frozen-lockfile --config.confirmModulesPurge=false`, and preview HTTP probes; article returned 200, unknown URL returned 404, sitemap returned 200 with XML content type. Preview server was stopped.

### Stage 3 implementation notes
- Added reusable SEO primitives for metadata, canonical URL, breadcrumbs JSON-LD, BlogPosting JSON-LD and ProfilePage/Person JSON-LD.
- Updated article page to render title/description, canonical, robots, real translationKey-based hreflang, x-default, breadcrumbs, BlogPosting and author profile links.
- Added project-owned editorial index `/redakcja/` and person profile `/redakcja/{person}/` with canonical metadata, breadcrumbs and ProfilePage/Person structured data.
- Added project-owned `src/pages/404.astro`; production preview verified unknown URLs return HTTP 404.
- Added generated `sitemap.xml`, `rss.xml`, `robots.txt` and `redirects.json`.
- Added redirect manifest coverage from article `redirectFrom`.
- Addressed Stage 2 carry-forward: CORE route/SEO helpers no longer hardcode `pl`; project route segments and locale remain project-owned, and hreflang alternates are generated only from existing published entries sharing the same `translationKey`.
- Did not start Stage 4 theme/performance work.

### Stage 2
- 2026-09-15 18:51 +02:00 - `pnpm content:validate` - PASS. Content validation reported 3 article(s), 1 person record, and 1 category.
- 2026-09-15 18:51 +02:00 - `pnpm test` - PASS. Vitest reported 3 test files passed and 10 tests passed, including draft/scheduled lifecycle, canonical/hreflang helpers, duplicate article id, duplicate route, unknown category and unknown author failures.
- 2026-09-15 18:52 +02:00 - `pnpm check` - PASS. Content validation, Astro typecheck and architecture boundary check passed.
- 2026-09-15 18:52 +02:00 - `pnpm build` - PASS. Static build completed with 2 page(s): `/index.html` and `/blog/poradniki/jak-przygotowac-przeprowadzke/index.html`.
- 2026-09-15 18:51 +02:00 - production build artifact inspection - PASS. Published sample article exists; draft article and scheduled article paths are absent from `dist`; generated article HTML contains canonical, `hreflang="pl"` and `hreflang="x-default"`.
- 2026-09-15 18:53 +02:00 - `pnpm dev -- --host 127.0.0.1 --port 4321` - PASS. Dev server started at `http://localhost:4321` and was stopped with `node scripts/run-astro.mjs dev stop`.

### Stage 2 implementation notes
- Added Astro 7 content collections via `src/content.config.ts` with `blog` and `people` loaders and strict schemas.
- Added representative Polish MDX content: one published article, one draft, and one scheduled article.
- Added `people` and category seed data using `people` as the authoritative person collection name.
- Added static route `/blog/{category}/{slug}/` for published articles.
- Added reusable content lifecycle filtering, localized route helpers, and canonical/hreflang helpers.
- Added build-time content validator and tests for duplicate IDs/routes, category validation and author validation.
- Strengthened `scripts/check-architecture.mjs` so relative imports are resolved to real filesystem target layers and cannot bypass CORE/FEATURES/THEME/PROJECT boundaries.
- Preserved provisional origin semantics by marking `projectConfig.originsAreProvisional = true`; `https://tragarze.pl` and `https://api.tragarze.pl` remain provisional until Q001 is resolved.
- Replaced temporary ASCII navigation labels with Polish UI labels `Usługi` and `Narzędzia`.
- Added `scripts/run-astro.mjs` so Astro commands run with telemetry disabled in this sandbox without requiring manual environment variables.

### Stage 1
- 2026-09-15 18:16 +02:00 - `pnpm install --frozen-lockfile --config.confirmModulesPurge=false` - PASS. Lockfile matches `package.json`; dependencies installed; `esbuild` approved explicitly in `pnpm-workspace.yaml`.
- 2026-09-15 18:16 +02:00 - `ASTRO_TELEMETRY_DISABLED=1 pnpm typecheck` - PASS. `astro check` reported 0 errors, 0 warnings, 0 hints.
- 2026-09-15 18:16 +02:00 - `ASTRO_TELEMETRY_DISABLED=1 pnpm build` - PASS. Static build completed with 1 page generated.
- 2026-09-15 18:16 +02:00 - `pnpm check:architecture` - PASS. Architecture boundary check passed.
- 2026-09-15 18:16 +02:00 - `pnpm peers check` - PASS. No peer dependency issues found after pinning TypeScript 5.9.3.
- 2026-09-15 18:17 +02:00 - `ASTRO_TELEMETRY_DISABLED=1 pnpm dev -- --host 127.0.0.1 --port 4321` - PASS. Dev server started at `http://localhost:4321` and was stopped with `astro.CMD dev stop`.

Note: `ASTRO_TELEMETRY_DISABLED=1` was required in this sandbox because Astro telemetry attempted to create `C:\Users\sunpl\AppData\Roaming\astro\Config`, which is outside the writable workspace. This was an environment permission issue, not a project type/build failure.

## Required Stage 7 checks
The exact Stage Gate in the current `SPEC.md` is authoritative. Verified checks include:
- Turnstile server-side verification boundary;
- normal published flow;
- one-link pending flow;
- multi-link pending / non-publishable invariant;
- invalid reject/no-store/no-write failure behavior;
- comments_count transition tests;
- keyset pagination;
- featuredIds excluded before LIMIT, including empty featured list;
- reply normalization;
- helpful and report endpoints;
- service-level moderation transitions and physical delete;
- Stage 1-6 regression checks continue to pass.

## Blockers
Local Stage 7 comments implementation is complete. Production/preview Cloudflare deployed verification remains BLOCKED until the user provides real Cloudflare authorization/configuration outside the repository:
- Cloudflare account permission to create/manage Workers and D1;
- real preview and production D1 database IDs/names;
- Worker deployment target for `tragarze-api`;
- production/preview Turnstile site-key/secret provisioning policy and `TURNSTILE_SECRET_KEY` configured in Cloudflare secret storage (Q005 remains open);
- exact confirmed production origins/domains if Q001 changes the provisional `https://tragarze.pl` / `https://api.tragarze.pl` defaults.

## Update rules
After work on a stage, record:
- date/time or commit/reference when available;
- commands/checks actually executed;
- PASS / FAIL / BLOCKED for each required check;
- concise evidence/error for failures;
- next executable action.

Never mark a stage complete from expectation, code review alone, or a previous chat's memory.
