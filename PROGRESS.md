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


## Low-end optimization update

User direction: prioritize tools that work well on low-end laptops without reducing result quality, then proceed. Replaced per-star Canvas submissions with a reusable full-resolution bilinear additive raster, dirty-row uploads, and cached sprites for bright stars. All 20,000 particles remain active; no resolution reduction.

Final measured machine: Intel Core i3-10110U, Intel UHD Graphics, hardware-accelerated Edge (working Chromium-based browser on this host).
- 1440×900: 16.97 ms average / 58.94 FPS (180 frames).
- 1280×720 at DPR 2 and 4× CPU throttle: 31.49 ms / 31.76 FPS (90 frames).
- Initial JS: 73.67 KB gzip.
- Typecheck, lint, 6 unit tests, build and 2 Playwright tests pass.
- Desktop, mobile and HiDPI screenshots reviewed. HiDPI output is 2560×1440 pixels.
- Physics now uses softened enclosed-mass orbital acceleration, tangential velocities after ignition, and drag compensation; 30-second bounded-orbit test passes.
- Background/starfield/particle layers are separate modules; DPR monitoring and window-resize listeners are disposed correctly.

Allocation tracking was performed through the DevTools HeapProfiler protocol for five seconds, with 18 heap-stat updates. The report is in `optimized/allocation-timeline.json`. It DOES report runtime allocations under renderer/accumulator call stacks (predominantly 12-byte entries); therefore literal zero allocations is not claimed. Source hot loops reuse buffers and contain no explicit object/array creation. Further runtime-allocation tuning and Chrome-specific verification remain open; these do not invalidate the measured low-end results. Later phase implementation proceeds per the user's latest direction, with these limitations carried forward rather than erased.

## Phase 2 — interaction implementation verified

Implemented six tools (Attract, Repel, Swirl, Shockwave, charged Supernova, Pan), pointer velocity transfer, independent simultaneous pointer sources, pinch/pan, cursor-anchored zoom (0.25×–4×), a responsive dock, keyboard selection, pause/step and camera reset. Supernova debris recycles the particle pool. Explosions are rate-limited and localized. Visual review led to lower force strengths and soft outer-boundary recovery so ordinary gestures do not empty the scene.

- Typecheck, lint, 9 unit tests, production build: passed.
- Full Playwright suite: 3 tests passed (foundation, interaction tools/mobile multi-touch, throttled HiDPI). After force tuning, the affected interaction test passed again.
- Reviewed `screenshots/phase-2/tools.png` and individual tool screenshots plus `multitouch.png`.
- Camera unit test verifies cursor world-position invariance under zoom and zoom bounds. Wave test verifies outward impulse; supernova test verifies particle conservation and burst rate limiting.
- Two simultaneous touch points were dispatched through Chromium's touch API, moved apart, then released without page errors.
- Latest steady-state measurement during the full suite: 17.37 ms (~57.56 FPS) with 20k particles; performance varies with host load. Initial JS: 76.85 KB gzip.
- Prior Phase 1 runtime-allocation and browser-specific verification caveats remain tracked; not presented as resolved.

## Phase 3 — cosmic objects and fields

Implemented gravity wells, absorbing/respawning black holes with capped growth and evaporation, vortices, draggable/resizable objects, desktop context deletion and mobile long-press deletion. Freeze supports Shift or a second tap to thaw, plus global thaw with Space. Added seeded curl-noise turbulence/flow with a cached 48×48 vector grid, streaks, an independently rendered nebula layer, and quarter-resolution bloom. The glow layer is separate from trails to prevent accumulating feedback/banding; slow layers are cached.

- Typecheck, lint, 12 unit tests and production build pass. Initial JavaScript: 81.12 KB gzip.
- Full 5-test browser suite passed before final layer caching; affected entity, foundation and low-end tests passed after the final renderer changes (4 tests).
- Black-hole conservation, entity limits/resize clamps, freeze/thaw: unit-tested.
- Placement, dragging, scrolling, right-click deletion, 12-object toast, mobile touch drag/long-press deletion: browser-tested.
- Reviewed black-hole, flow, bloom on/off, and mobile screenshots in `screenshots/phase-3/`.
- Latest host-loaded performance sample: 39.23 ms at 20k; DPR 2 with 4× CPU throttling: 75.08 ms. Earlier same-stage sample before the final run was ~20.25 ms. These are diagnostics, not a claim that the final performance budget passes. Host build/unit-test timings also slowed substantially in the last run. Phase 4 includes the specified governor; performance remains a release gate.
- Runtime allocation / exact Chrome browser caveats from Phase 1 remain open.
