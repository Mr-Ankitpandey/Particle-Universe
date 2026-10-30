import { describe, expect, it } from "vitest";
import { defaultScene } from "../../src/scene/defaults";
import { sceneSchema } from "../../src/scene/schema";
import { migrate } from "../../src/scene/migrate";
import { presets } from "../../src/scene/presets";
import { randomize } from "../../src/scene/randomize";
import { History } from "../../src/state/history";
import { PerformanceGovernor } from "../../src/engine/core/PerformanceGovernor";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
import { Simulation } from "../../src/engine/core/Simulation";

describe("scene contract", () => {
  it("restores tangential motion after a scene transition", () => {
    const buffer = new ParticleBuffer(1);
    buffer.x[0] = buffer.hx[0] = 0.5;
    buffer.y[0] = buffer.hy[0] = 0;
    const simulation = new Simulation(buffer);
    simulation.time = 4;
    simulation.morph.remaining = 0.01;
    simulation.step(1 / 60);
    expect(buffer.vy[0]).toBeGreaterThan(0);
    expect(Math.abs(buffer.vx[0] ?? 0)).toBeLessThan(0.01);
  });
  it("rejects unsafe counts and nonfinite physics, strips unknown fields", () => {
    for (const count of [0, 60001, Infinity, NaN]) {
      const scene = structuredClone(defaultScene);
      scene.galaxy.particleCount = count;
      expect(sceneSchema.safeParse(scene).success).toBe(false);
    }
    expect(
      sceneSchema.parse({ ...defaultScene, script: "bad" }),
    ).not.toHaveProperty("script");
    expect(
      sceneSchema.safeParse({
        ...defaultScene,
        physics: { ...defaultScene.physics, gravity: NaN },
      }).success,
    ).toBe(false);
  });
  it("migrates a v0 scene and rejects future versions", () => {
    expect(migrate({ version: 0, name: "Old universe", seed: 42 })).toEqual({
      ...defaultScene,
      name: "Old universe",
      seed: 42,
    });
    expect(() => migrate({ ...defaultScene, version: 9 })).toThrow();
  });
  it("validates six presets and deterministic diverse random scenes", () => {
    expect(presets).toHaveLength(6);
    presets.forEach((scene) =>
      expect(sceneSchema.safeParse(scene).success).toBe(true),
    );
    const scenes = Array.from({ length: 20 }, (_, i) => randomize(i + 100));
    expect(new Set(scenes.map((scene) => scene.name)).size).toBe(20);
    expect(randomize(100)).toEqual(scenes[0]);
    expect(randomize(101, defaultScene, true).galaxy).toEqual(
      defaultScene.galaxy,
    );
  });
});
it("bounds undo history, isolates snapshots and clears redo after branching", () => {
  const history = new History();
  for (let seed = 0; seed < 60; seed++) history.push({ ...defaultScene, seed });
  expect(history.undoCount).toBe(50);
  const previous = history.undo(defaultScene);
  expect(previous.seed).toBe(59);
  expect(history.redo(previous)).toEqual(defaultScene);
  history.undo(defaultScene);
  history.push(previous);
  expect(history.redoCount).toBe(0);
});
it("governor degrades with hysteresis, respects floor, recovers and locks", () => {
  const governor = new PerformanceGovernor();
  for (let i = 0; i < 1000; i++) governor.update(40, 0.04, 35);
  expect(governor.fraction).toBe(0.25);
  expect(governor.tier).toBe("low");
  for (let i = 0; i < 5000; i++) governor.update(16.67, 1 / 60, 6);
  expect(governor.fraction).toBe(1);
  expect(governor.tier).toBe("high");
  governor.lock = "medium";
  governor.update(50, 0.05, 45);
  expect(governor.maxDpr).toBe(1.5);
  expect(governor.fraction).toBe(1);
});
