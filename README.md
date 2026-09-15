# astro-blog-config

Reusable Astro starter for `tragarze.pl`, implemented stage by stage from the authoritative project contracts in this repository.

## Current Target

Stage 1: repository skeleton.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm check
```

## Architecture Boundary

The repository follows the dependency direction documented in `SPEC.md` and `docs/ARCHITECTURE_BOUNDARIES.md`:

```text
PROJECT -> THEME -> FEATURES -> CORE
```

`CORE` contains reusable mechanics only. Project-specific decisions live in `src/project/` and `docs/PROJECT_TRAGARZE.md`.
