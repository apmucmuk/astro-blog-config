# PROJECT_TRAGARZE.md

Status: project-specific implementation contract for tragarze.pl.
Authoritative architecture: `SPEC.md`. This file contains only decisions and data specific to the first production clone.

## 1. Project identity

- Project: tragarze.pl
- Primary locale: Polish (`pl`)
- Explanatory/internal documentation language: Russian is allowed; public UI/content is Polish.
- Initial geography: Gornoslasko-Zaglebiowska Metropolia, with operational focus around Sosnowiec / inner ring when availability constraints require it.
- Product type: local moving-services content + service pages + tools; blog is not a separate product homepage.

## 2. Public route contract

```text
/uslugi/
/uslugi/{service}/
/uslugi/{city}/
/uslugi/{city}/{service}/
/blog/
/blog/{category}/
/blog/{category}/{slug}/
/narzedzia/
/narzedzia/{slug}/
/redakcja/{person-slug}/
```

Blog pagination follows SPEC: `/blog/page/{page}/` and `/blog/{category}/page/{page}/`; `/page/1/` is forbidden.

## 3. Services

Initial service taxonomy must support at least:
- przeprowadzki mieszkan i domow;
- przeprowadzki biur;
- male magazyny i firmy;
- relokacje wewnetrzne;
- tragarze bez transportu;
- tragarze z busem / transport;
- dostawy ze sklepow;
- montaz i demontaz;
- gabaryty: pianino, sejf i podobne;
- IT / elektronika;
- pakowanie;
- wywoz / utylizacja.

Exact slugs are PROJECT data and must be validated centrally; do not hard-code them across components.

## 4. Geography

City pages are unique SEO landing pages. Do not create district landing pages.
Katowice districts are represented as an interactive/content block inside Katowice city pages. The data model must support all 22 districts with nominative name plus W/Z/DO forms and aliases.

City dictionaries must support Polish declensions/phrases required by templates, e.g. Katowice: `w Katowicach`, `z Katowic`, `do Katowic`.

## 5. Content model

MDX is the editorial source of truth. City/service overlays may override general blocks without creating a second editorial database. Generated manifests remain build artifacts according to SPEC.

Required article frontmatter follows SPEC, including stable `id`, `title`, `description`, `slug`, `locale`, `translationKey`, `publishDate`, authors/contributors, category/tags, image, draft, and optional updated metadata.

## 6. Blog / discovery

Until separate products justify a broader site homepage, `/blog/` is a content hub, not the main site homepage.
Category pages support sorting according to SPEC. Recommended v1 discovery surfaces: Featured, Popularne teraz, Najnowsze, Categories.

Search implementation default for v1: Pagefind, generated from published static content only. Search must exclude drafts, scheduled content and noindex content where appropriate.

## 7. Authors / editorial

Use collection name `people` for people/person records. Roles follow SPEC: editor_in_chief, senior_editor, editor, author, contributor. Author pages are required and indexable when the person has public publications and is not explicitly noindex.

Virtual personas are allowed only within the truthfulness constraints in SPEC; do not invent verifiable credentials, employers, licenses or external profiles.

## 8. Runtime features

Runtime stack: Cloudflare Workers + D1 + Turnstile. Static content remains usable when runtime API fails.

Enabled for v1:
- qualified reads;
- article stats;
- comments;
- article rating;
- popularity rankings;
- moderation admin for comments.

Leads/forms are OFF in starter v1 until a separate contract is approved. Do not let Codex invent a lead schema/API.

## 9. Qualified reads / popularity

Qualified read: 10 seconds OR 25% scroll, then frontend local dedup + Worker abuse/rate controls as defined by SPEC.

For tragarze.pl v1 choose the simple immediate write strategy: every accepted qualified read atomically updates both all-time `article_stats.reads` and the current UTC `article_read_daily` bucket. Do not introduce queues/batching until measured traffic justifies it.

Default `popularityWindowDays = 7`.

## 10. Comments / rating

Comments and rating follow the authoritative SPEC exactly. No reviews system is implied by article comments. Article rating is 1-5 stars and uses the Bayesian ranking contract from SPEC.

## 11. SEO

- Polish is the default locale and is not prefixed.
- Canonicals, hreflang, sitemap, RSS, pagination and sort-query behavior follow SPEC.
- City-service pages may self-canonical when content is genuinely unique; otherwise canonical strategy must be explicit in PROJECT SEO config.
- No district SEO pages.
- Custom 404 required with real HTTP 404 behavior.

## 12. Design

Mobile-first, baseline includes iPhone 13 mini width. Visual direction: approximately 60% Vercel / 40% Linear, but implemented as an original project theme.
Two schemes: light/dark; default follows system, fallback light. One brand accent. No Bootstrap.

## 13. Repository / bootstrap

Build the reusable starter from the beginning with PROJECT=`tragarze`, rather than building a one-off tragarze implementation and extracting a core later.

Expected separation:
```text
CORE -> universal primitives/contracts
FEATURES -> optional feature modules
THEME -> visual system for clone
PROJECT -> tragarze-specific configuration/content
```

## 14. Initial engineering defaults

Unless superseded by a deliberate SPEC revision:
- Node: current active LTS supported by chosen Astro release;
- package manager: pnpm with committed lockfile;
- Astro: latest stable at bootstrap, then pinned through lockfile;
- unit/component tests: Vitest;
- browser/E2E: Playwright;
- accessibility checks: axe in automated browser tests where practical;
- search: Pagefind;
- deployment: Cloudflare Pages/static hosting + Workers/D1 for runtime.

Do not silently upgrade major framework/runtime versions during implementation.

## 15. Open project data

The following are intentionally PROJECT data and must be supplied/confirmed before production launch rather than invented:
- final production and API domains;
- exact service slugs and category taxonomy;
- final city coverage/operational radius;
- real author identities/biographies;
- brand assets/logo/favicon/social image;
- analytics IDs if used;
- Search Console ownership/property;
- Cloudflare account/database/Worker identifiers;
- production secrets.
