# CURRENT_STAGE.md

## Purpose
Factual implementation status for the active project. This file records what has actually been implemented and verified. It does not define architecture.

## Active project
`tragarze.pl`

## Current stage
Stage 3 - SEO shell.

## Status
`complete`

Stage 3 implementation has been verified locally in the repository branch `codex/stage-3-seo-shell`.

## Verified checks
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

## Required Stage 3 checks
The exact Stage Gate in the current `SPEC.md` is authoritative. Verified checks include:
- title/description;
- canonical;
- hreflang;
- robots behavior;
- sitemap;
- RSS;
- breadcrumbs;
- BlogPosting;
- Person/Profile where applicable;
- 404 real route/template behavior;
- redirect manifest.

## Blockers
None for Stage 3. Existing open questions do not block SEO shell work.

## Update rules
After work on a stage, record:
- date/time or commit/reference when available;
- commands/checks actually executed;
- PASS / FAIL / BLOCKED for each required check;
- concise evidence/error for failures;
- next executable action.

Never mark a stage complete from expectation, code review alone, or a previous chat's memory.
