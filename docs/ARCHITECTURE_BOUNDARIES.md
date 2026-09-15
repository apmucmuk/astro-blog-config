# Architecture Boundaries

Stage 1 establishes the physical layer model from `SPEC.md`.

## Dependency Direction

```text
PROJECT -> THEME -> FEATURES -> CORE
```

Allowed imports:
- `src/project/**` may import `@theme/*`, `@features/*`, and `@core/*`.
- `src/theme/**` may import `@features/*` and `@core/*`.
- `src/features/**` may import `@core/*`.
- `src/core/**` may not import project, theme, or feature code.

Forbidden imports:
- `src/core/**` importing `@features/*`, `@theme/*`, or `@project/*`.
- `src/features/**` importing `@theme/*` or `@project/*`.
- `src/theme/**` importing `@project/*`.

The baseline architecture check is `pnpm check:architecture`.
