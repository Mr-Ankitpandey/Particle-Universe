import { expect, it } from "vitest";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
import { Simulation } from "../../src/engine/core/Simulation";
import { galaxy } from "../../src/engine/generators/galaxy";
it("ignites and maintains finite bounded orbits without losing particles", () => {
  const particles = new ParticleBuffer(256);
  galaxy(particles, 4217);
  const sim = new Simulation(particles);
  for (let step = 0; step < 150; step++) sim.step(1 / 60);
  const radii = Float32Array.from(particles.x, (x, i) =>
    Math.hypot(x, particles.y[i] ?? 0),
  );
  for (let step = 0; step < 1800; step++) sim.step(1 / 60);
  expect(particles.count).toBe(256);
  for (let i = 0; i < particles.count; i++) {
    expect(Number.isFinite(particles.x[i])).toBe(true);
    expect(Math.hypot(particles.x[i] ?? 0, particles.y[i] ?? 0)).toBeCloseTo(
      radii[i] ?? 0,
      1,
    );
  }
});
