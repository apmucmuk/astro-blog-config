# OPEN_QUESTIONS.md

## Purpose
Only unresolved decisions that materially affect correct implementation belong here.

Resolved decisions must be moved into the appropriate authoritative contract (`PROJECT_TRAGARZE.md`, `CLOUDFLARE_SETUP.md`, `.env.example`, or `SPEC.md`) and removed from the open questions table.

This is not a backlog, feature wishlist, meeting log, or implementation status file.

## Questions

| ID | Domain | Question | Status | Decision / destination |
|---|---|---|---|---|
| Q001 | Domains | What are the final production site origin and API origin? | open | When resolved: PROJECT_TRAGARZE.md + CLOUDFLARE_SETUP.md + env contract |
| Q002 | Brand assets | What final logo, favicon and default OG/social assets are authoritative for launch? | open | When resolved: PROJECT_TRAGARZE.md |
| Q003 | Geography | What is the final launch city set, distinct from the broader planned agglomeration coverage? | open | When resolved: PROJECT_TRAGARZE.md |
| Q004 | Runtime hardening | Confirm concrete Worker rate-limit implementation/default thresholds where SPEC/project docs intentionally leave provider-level details configurable. | open | When resolved: CLOUDFLARE_SETUP.md |
| Q005 | Turnstile | Confirm preview/staging/prod Turnstile site-key/secret provisioning policy and test-key behavior. | open | When resolved: CLOUDFLARE_SETUP.md + .env.example |

## Resolved decision index / consistency checklist
This block is not part of the open-question list. It is a compact consistency index for decisions already owned by authoritative project/ops contracts.

- package manager: pnpm;
- search v1: Pagefind;
- people/person collection naming: `people`;
- reusable starter from the beginning with tragarze.pl as PROJECT layer;
- Cloudflare Pages + Workers + D1 runtime direction;
- leads/forms disabled for starter v1;
- district landing pages are not part of the current tragarze.pl URL model;
- canonical Turnstile Worker secret env name: `TURNSTILE_SECRET_KEY`.

Do not reopen these without an explicit user/contract change. If an authoritative file contradicts this index, treat it as a consistency defect and reconcile the authoritative files rather than silently choosing one.
