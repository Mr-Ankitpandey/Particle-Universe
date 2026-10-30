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

- Following the user's low-end priority, replace individual tiny-star Canvas draws with bilinear additive CPU rasterization and dirty-row uploads. This changes the prescribed implementation technique while retaining Canvas 2D, full resolution and all particles; measurements improved from 20 FPS to ~59 FPS on the actual i3 laptop.
- Use hardware-accelerated Edge as the working browser for local validation; keep Chrome-specific release verification outstanding.

- Cache a seeded curl-noise vector grid and interpolate it per particle; this avoids four simplex evaluations per particle per step.
- Render nebula and quarter-resolution bloom on separate canvas layers to prevent trail feedback, preserve dark space, and avoid repeated full-resolution glow uploads.

- Governor recovery uses measured simulation-plus-render work below 13ms while frame intervals remain below 19ms; a 60Hz display cannot produce sustained sub-13ms rAF intervals even when the CPU has ample headroom.
- Optional STATIC_PREVIEW browser-test transport serves production files through Playwright routing because loopback TCP timed out even outside the sandbox. Normal preview-server coverage remains separate.
- Audio mapping values are part of the scene contract now; audio input/playback remains Phase 7. Image creation and image color data remain Phase 5.
