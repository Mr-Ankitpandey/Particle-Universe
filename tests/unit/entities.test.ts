import { expect, it } from "vitest";
import { EntityManager } from "../../src/engine/entities/EntityManager";
import { BlackHole } from "../../src/engine/forces/BlackHole";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
import { Simulation } from "../../src/engine/core/Simulation";
it("black holes conserve particle count while absorbing and respawning", () => {
  const entities = new EntityManager();
  entities.add("blackHole", 0, 0);
  const b = new ParticleBuffer(1000);
  const hole = new BlackHole(entities);
  hole.apply(b, 1 / 60);
  expect(b.count).toBe(1000);
  for (let i = 0; i < b.count; i++) {
    expect(Math.hypot(b.x[i] ?? 0, b.y[i] ?? 0)).toBeGreaterThan(0.7);
    expect(Number.isFinite(b.vx[i])).toBe(true);
  }
  expect(entities.items[0]?.mass).toBeGreaterThan(1);
});
it("limits objects and clamps their resize parameters", () => {
  let message = "";
  const entities = new EntityManager((value) => (message = value));
  for (let i = 0; i < 13; i++) entities.add("vortex", 0, 0);
  expect(entities.items).toHaveLength(12);
  expect(message).toContain("12");
  entities.resize(1, 1e6);
  expect(entities.find(1)?.mass).toBe(4);
  entities.remove(1);
  expect(entities.items).toHaveLength(11);
});
it("frozen particles skip integration and thaw with momentum", () => {
  const b = new ParticleBuffer(1);
  b.x[0] = 0.3;
  b.y[0] = 0.2;
  b.flags[0] = 1;
  const sim = new Simulation(b);
  sim.time = 4;
  sim.step(1 / 60);
  expect(b.x[0]).toBeCloseTo(0.3);
  expect(sim.freeze.thaw(b)).toBe(true);
  expect(b.flags[0]).toBe(0);
  expect(b.vx[0]).not.toBe(0);
});
