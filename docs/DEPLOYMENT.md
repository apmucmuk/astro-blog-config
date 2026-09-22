# Deployment adapter

This repository deploys `dist/` as static Astro output and `worker/` as the separate API Worker. Do not use a production database, origin, Access value, Turnstile secret or Cloudflare account identifier in Git.

## Environment setup

Create untracked files from `worker/wrangler.preview.example.jsonc` and `worker/wrangler.production.example.jsonc`. Replace only the marked deployment values with the environment-specific Worker name, D1 binding and exact allowed site origin. Configure `TURNSTILE_SECRET_KEY`, `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` through Cloudflare secret/environment bindings, never in these files.

Preview and production require separate D1 databases. Preview static output is built with noindex headers and a disallowing `robots.txt`; production output has the canonical indexing policy.

## Ordered deployment

For each environment, run the ordered stages after external Cloudflare configuration exists:

1. `pnpm deploy:preview:build` or `pnpm deploy:production:build`.
2. Copy the matching Wrangler example to its untracked runtime config and populate its real environment values.
3. Apply versioned migrations: `pnpm worker:migrations:preview` or `pnpm worker:migrations:production`.
4. Generate and sync the runtime registry: `pnpm worker:registry:sync:preview` or `pnpm worker:registry:sync:production`.
5. Deploy the compatible Worker using the matching untracked Wrangler config.
6. Deploy the generated `dist/` directory to the configured static host.
7. Run the deployment HTTP checklist from `CURRENT_STAGE.md` against the real hosts.

For removal, publish and verify the redirect/404/410 behavior first, then run the registry sync to disable the old runtime article. Stable article IDs preserve runtime aggregates across slug changes.

## Static hosting artifacts

`pnpm build` generates Cloudflare Pages-compatible `dist/_redirects` and `dist/_headers`, plus `dist/deployment-manifest.json`. Redirects include historical `redirectFrom` entries and `/page/1/` normalization. Headers set baseline security policies, short revalidation for HTML, immutable caching for fingerprinted `/_astro/` assets and bounded caching for Pagefind/static scripts.

Host/HTTPS normalization, DNS/TLS, Cloudflare Access policies, D1 backup/restore and real deployment verification require external account configuration and remain outside repository execution.
