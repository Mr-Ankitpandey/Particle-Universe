# Particle Universe build plan

Follow the supplied master brief in order. Each phase must pass typecheck, lint, unit tests, production build and reviewed Playwright screenshots before the next begins.

1. Foundation and ignition: strict React/Vite scaffold, typed particle buffers, seeded generation, fixed timestep, layered Canvas renderer, ignition, stats. Measure 20k performance and allocations.
2. Touch the universe: pointer tools, charge effects, multi-touch, camera, keyboard.
3. Cosmic objects and fields: draggable entities, freeze, curl noise, nebula, bloom, streaks.
4. Scene contract: validation, six presets, settings, randomization, history, adaptive quality.
5. Creation: text, nine parametric shapes, local photos and morph choreography.
6. Persistence and sharing: IndexedDB gallery, links, JSON, PNG and video.
7. Audio: lazy analysis and procedural sound.
8. Release: onboarding, accessibility, responsive layouts, cross-browser and performance verification, documentation.
9. Optional AI director, only after all Phase 8 gates pass and an endpoint is available for verification.

Commit and push each completed phase to the requested GitHub repository. Never label an unverified phase complete.
