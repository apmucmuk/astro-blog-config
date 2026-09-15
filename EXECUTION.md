# EXECUTION.md

## Purpose
This file defines how an implementation agent (including Codex) must execute the project. It is an execution contract, not a replacement for the architecture specification.

## Authority order
When requirements conflict, use this order:
1. Explicit user request in the current task/chat.
2. Current `SPEC.md` in this Drive/config set.
3. `docs/PROJECT_TRAGARZE.md`.
4. `docs/CLOUDFLARE_SETUP.md`.
5. `docs/OPEN_QUESTIONS.md` only for decisions explicitly marked resolved.
6. `.env.example`.
7. `CURRENT_STAGE.md` for implementation state only.

The authoritative specification is the current `SPEC.md` file in this Drive/config set, not any version label remembered by a previous chat.

`CURRENT_STAGE.md` never overrides requirements. It only records implementation progress and verification results.

## Active project
`tragarze.pl`

## Execution model
Implementation proceeds by the Stage Gates defined in `SPEC.md`.

For every stage:
1. Read the current authoritative files before implementation.
2. Implement only the current stage and prerequisites required by that stage.
3. Run all acceptance checks for the stage.
4. Record factual results in `CURRENT_STAGE.md`.
5. Do not mark a check as passed unless it was actually executed successfully.
6. Do not advance to the next stage while a required gate is failing or blocked.
7. If a missing decision prevents correct implementation, add it to `docs/OPEN_QUESTIONS.md` and stop only the affected work.

## Source-of-truth boundaries
- Reusable architecture and cross-project rules -> `SPEC.md`.
- tragarze.pl-specific decisions -> `docs/PROJECT_TRAGARZE.md`.
- Cloudflare/runtime/deployment operations -> `docs/CLOUDFLARE_SETUP.md`.
- unresolved decisions -> `docs/OPEN_QUESTIONS.md`.
- current implementation state -> `CURRENT_STAGE.md`.
- environment variable names/classification -> `.env.example`.

Do not duplicate authoritative contracts across files unless a short cross-reference is required.

## Do not implement yet
Unless the current SPEC/project contract is explicitly changed:
- leads/forms;
- custom authentication;
- third-party analytics SDK;
- district landing pages;
- ISR/runtime publication model;
- features not required by the active Stage Gate.

## Change discipline
Do not silently invent architectural decisions.
Do not rewrite `SPEC.md` to describe implementation progress.
Do not use `OPEN_QUESTIONS.md` as a backlog or idea dump.
Do not treat a remembered SPEC version number as authority.
Do not weaken validation/security/SEO contracts to make a stage pass.

If implementation exposes a contradiction between authoritative files, report the exact conflict before choosing a new contract.

## Initial execution target
Current target is Stage 1 / repository skeleton unless `CURRENT_STAGE.md` records a later verified stage.

Before advancing beyond Stage 1, at minimum verify the Stage 1 acceptance contract from `SPEC.md`, including installation, development startup, production build, type checking, required architecture directories and dependency direction.

## Stage implementation map

This is an execution summary of the authoritative Stage Gates in `SPEC.md` section 93. The SPEC remains authoritative for exact acceptance criteria.

### Stage 1 - Repository skeleton
Implement the Astro/TypeScript/MDX/React project scaffold with pnpm, scripts, baseline lint/check/typecheck, and the CORE -> FEATURES -> THEME -> PROJECT directory/layer model. Establish dependency direction before feature code. No business-specific code in CORE and no global React application.

Gate: install, dev, build and typecheck succeed; baseline checks exist; architecture directories and dependency direction are present/documented.

### Stage 2 - Content + routing + i18n
Implement Content Collections/MDX schemas, stable article/person/category identity, publication lifecycle validation, route helpers, localized route map and representative Polish content. Draft/future content must not leak into production.

Gate: representative article renders; duplicate IDs/routes fail; category/author validation works; draft/scheduled exclusion works; localized routes and representative canonical/hreflang tests pass.

### Stage 3 - SEO shell
Implement reusable SEO primitives and project-owned metadata: title/description, canonical, hreflang, robots, sitemap, RSS, breadcrumbs, BlogPosting, Person/Profile, 404 behavior and redirect manifest.

Gate: inspect representative production-build HTML, not only source code.

### Stage 4 - Theme + performance baseline
Implement the first tragarze.pl theme on the static-first shell: typography, layout, article/listing cards, light/dark schemes, responsive behavior, images/fonts and accessibility basics. React remains isolated to real interaction.

Gate: readable without JS; required widths have no horizontal overflow; image/font/hydration rules hold; focus/skip-link requirements pass.

### Stage 5 - Worker + D1 foundation
Create Cloudflare Worker/D1 runtime, migrations, `/health`, canonical D1 tables, runtime content registry, shared DTO/runtime schemas, lazy `article_stats` initialization, error contract, environment separation and no-store mutation responses.

Implementation must follow `docs/CLOUDFLARE_SETUP.md`. Secrets never enter Git. D1 schemas/migrations are authoritative runtime storage, not editorial metadata.

### Stage 6 - Rating
Implement anonymous visitor rating 1-5 with one active vote per article/visitor, vote update, aggregates, personalized `myRating`, runtime validation and abuse/rate-limit path. UI is a small progressive-enhancement island.

Gate includes insert/update/UNIQUE/aggregate/invalid-vote tests and static article resilience when rating API fails.

### Stage 7 - Comments
Implement Turnstile-protected comments, moderation state machine, one-link pending rule, 2+ link spam-only path, keyset pagination, static featured comments, helpful/report/reply normalization and admin-compatible moderation transitions.

Gate verifies server Turnstile, no-store/no-write failure behavior, aggregate transitions and pagination invariants.

### Stage 8 - Reads + stats snapshots
Implement qualified-read detector (10s OR 25% scroll), browser-local per-article dedup, accepted-read writes to all-time and daily aggregates, and authoritative `/v1/stats` ranking snapshot. Listing/discovery uses a batch snapshot, never N per-card requests.

Gate verifies one POST per page session, no heartbeat, anonymous simple dedup, authoritative snapshot and graceful static fallback.

### Stage 9 - Admin + Cloudflare Access
Implement the minimal comments moderation admin surface behind Cloudflare Access. Do not create a custom authentication stack. Verify Access identity/policy at the Worker boundary and required moderation actions.

Gate verifies protected API/path, moderation transitions and physical deletion/purge behavior where SPEC requires it.

### Stage 10 - Search
Integrate Pagefind into the production build. Index only published/indexable content, respect locale, exclude draft/scheduled content, and keep search results UI non-indexable by default. Search is progressive enhancement and cannot break normal article navigation.

### Stage 11 - Deploy adapter
Implement provider/deploy outputs required by SPEC: redirects, URL normalization, HTTP->HTTPS/host normalization where hosting layer owns it, cache headers and API/static routing. Verify behavior with real HTTP responses.

Gate requires canonical 200, historical 301 + Location, unknown 404, `/page/1/` normalization, host/HTTPS normalization, mutation no-store and hashed-asset caching.

### Stage 12 - Production QA
Run final production-like verification: Search Console/sitemap, representative URL inspection, structured data, mobile widths, keyboard, JS-disabled mode, slow/unavailable API, Turnstile failure, cold-load performance, console/runtime errors and secret exposure review.

Production release is additionally blocked until the Security Gate, Design/CSS Gate, Browser Compatibility Gate, Runtime Data/Operations Gate, and Final Contract Regression Gate pass.

## How stages are handed to Codex

For each stage, the task should identify the stage number and instruct Codex to:
1. read `EXECUTION.md`, current `SPEC.md`, `docs/PROJECT_TRAGARZE.md`, relevant ops/open-question files, and `CURRENT_STAGE.md`;
2. implement only that stage plus unavoidable prerequisites;
3. run the exact gate checks from `SPEC.md` section 93;
4. fix failures inside the current contract rather than disabling checks;
5. update `CURRENT_STAGE.md` with commands/evidence and PASS/FAIL/BLOCKED;
6. stop before the next stage until the current gate is verified.

Open questions that do not affect the active stage do not block unrelated work.

## Production cross-stage gates

The following are not optional extra features; they are release gates spanning multiple stages:
- Security Gate - origin/CORS/input validation/prepared D1/Turnstile/cookies/XSS/request limits/rate limits/security headers/CSP/secrets/error redaction/lockfile.
- Design/CSS Gate - themes/tokens/responsive/mobile/focus/reduced motion/no CSS drift.
- Browser Compatibility Gate - native scrolling, iOS Safari, Android Chrome, landscape, keyboard, dialogs, safe areas, first paint/orientation.
- Runtime Data/Operations Gate - registry sync, lifecycle rejection, stats snapshot, global sort, credentialed API, migrations/backup/restore/log redaction/retention.
- Final Contract Regression Gate - SPEC references, endpoints, DTO/runtime schema, D1 migrations, ownership, dependency direction and absence of disabled production gates.

A stage may be locally complete while one of these cross-stage gates still has future checks. `CURRENT_STAGE.md` must distinguish stage completion from production readiness.
