# Decisions

- Preserve the user's Vite/React/Canvas stack and GitHub destination; hosting is outside this repository implementation task.
- Start with normalized world positions so resizing preserves deterministic geometry.
- Phase gates are strict; unavailable device or allocation evidence must be recorded honestly rather than inferred from compilation.

- Use the supplied pnpm runtime to run package scripts because npm is absent on this host; npm-compatible scripts remain in package.json.
- Add @types/node as development tooling for the Playwright evidence writer's node:fs import.
- Preserve the 20,000-particle requirement while measuring; do not silently lower the count to claim the performance gate.
- Revert experimental path batching: it improves submission overhead but changes additive overlap and still misses the target.
- Keep transparent particle-layer decay so the independently rendered starfield remains visible; the exact background-color fade implementation remains a specification difference to resolve.
- Use installed Edge for accelerated diagnostics; keep portable Playwright Chromium as the default and allow PLAYWRIGHT_CHANNEL overrides.
