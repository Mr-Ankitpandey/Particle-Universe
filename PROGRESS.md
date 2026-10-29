# Progress

- [ ] Phase 1 — implemented foundation checkpoint; performance and remaining verification gates open.
- [ ] Phase 2 — not started (depends on Phase 1).
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
- [ ] Phase 7
- [ ] Phase 8
- [ ] Optional Phase 9

## Phase 1 evidence — 2026-10-30

Implemented strict React 19/TypeScript/Vite setup, design tokens, typed particle buffer, seeded RNG and spiral generation, capped fixed-step accumulator, ignition convergence, orbital-target force and drag, cached additive glow, separate background and particle canvases, responsive DPR sizing, visibility handling, and F statistics.

### Checks

- Typecheck, lint, all 3 unit tests, production build and the Playwright smoke test passed on the final checkpoint. The separate performance acceptance gate remains failed.
- Unit tests: seed determinism across 20,000 particles, RNG distribution sanity, accumulator fractional steps and catchup cap.
- Browser smoke: desktop 1440×900 and mobile 390×844, stats shortcut, resize, no page errors. Screenshots reviewed: `screenshots/phase-1/desktop.png`, `mobile.png`.
- Initial production JavaScript: approximately 72.8 KB gzip, below 220 KB.

### Performance gate: NOT PASSED

180 consecutive requestAnimationFrame intervals were measured after ignition, with 20,000 active particles:

| Browser/rendering                           | Average interval | Equivalent FPS |
| ------------------------------------------- | ---------------: | -------------: |
| Chromium headless shell, software rendering |         87.48 ms |          11.43 |
| Edge, Intel UHD accelerated Canvas          |         48.32 ms |          20.70 |
| Experimental batched rect paths in Edge     |         36.90 ms |          27.10 |

The path-batching experiment was reverted because it did not meet the performance target and changed overlapping additive light behavior. The final smoke run writes its own current measurement to `performance.json`; the table preserves earlier experiments.

GPU diagnostics: `gpu.json` shows software-only Canvas/compositing; `gpu-edge.json` confirms accelerated Canvas/compositing and Intel UHD Graphics. Full downloaded Chromium failed to launch (`spawn UNKNOWN`); installed Edge worked. No measured run meets the required 58 FPS. These measurements must not be represented as performance on the specified modern laptop class.

CPU and sampled allocation profiles are retained in `screenshots/phase-1`. There are no explicit per-particle object allocations in the source hot loops, but a full DevTools allocation timeline proving zero hot-loop allocations remains outstanding. Sampling alone does not prove this requirement.

### Outstanding Phase 1 work

- Reach and verify 58+ FPS at 20,000 particles in Chrome on qualifying hardware.
- Complete allocation-timeline verification and DPR-change checks.
- Refine the orbital model: current rotation uses moving home positions and a damped spring; the specified enclosed-mass tangential velocity model is not implemented yet.
- Further visual refinement: brighter diffuse arms without an overexposed center; current screenshots are a foundation preview, not final astrophotography approval.
- Complete the specified renderer module split and remaining lifecycle details before marking Phase 1 done.

No later phase is claimed complete. Git checkpoints preserve reviewable work without representing a failed gate as passed.

Final retained-renderer measurement: 49.86 ms average over 180 frames (20.06 FPS), at 1440×900 in hardware-accelerated Edge. Clean pnpm frozen-lockfile installation also succeeded with esbuild explicitly allowed.

