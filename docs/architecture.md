# Architecture

This repository is migrating from legacy browser-style modules to a maintainable, type-safe architecture.

## Current Layers

### Backend

- `server.py`: local Flask server, serves HTML pages under `src/` and implements workspace APIs under `/tvbot/*`.

### Frontend (Legacy, still used)

- `src/*.html`: multi-page UI.
- `src/js/*`: legacy modules (some TypeScript files exist here but use legacy patterns and may have `@ts-nocheck`).
- `src/css/*`, `src/img/*`: static assets.

### Frontend (Core, strict TypeScript)

- `src/core/*`: strict TypeScript-only modules.
- Rules:
  - Put business logic, parsing, matching, layout, export math here.
  - Keep DOM/D3/UI code out of `src/core`.
  - Legacy pages should call `src/core` modules as a dependency until legacy code is fully retired.

## TypeScript Strategy (Dual Track)

- Legacy typecheck: `npm run typecheck:legacy` (tolerant, supports gradual migration)
- Strict typecheck: `npm run typecheck:strict` (only `src/core`, enforced)

New code must be added under `src/core` and must pass strict checks.

## Migration Roadmap (High ROI First)

1. Tree parsing + tree model (core types + parser facade + tests)
2. Export (PDF/SVG) layout math as pure functions (then workerize)
3. Tanglegram matching + state management (pure logic in core)
4. Replace legacy globals (axios/d3) with module imports where safe

