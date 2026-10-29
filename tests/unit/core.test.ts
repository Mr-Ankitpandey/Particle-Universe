import { describe, it, expect } from "vitest";
import { Rng } from "../../src/engine/core/Rng";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
import { galaxy } from "../../src/engine/generators/galaxy";
import { Accumulator } from "../../src/engine/core/Loop";
describe("foundation", () => {
  it("reproduces every particle from the seed", () => {
    const a = new ParticleBuffer(20000),
      b = new ParticleBuffer(20000);
    galaxy(a, 42);
    galaxy(b, 42);
    expect(a.x).toEqual(b.x);
    expect(a.hue).toEqual(b.hue);
  });
  it("has a sane uniform distribution", () => {
    const r = new Rng(42);
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 10000).toBeCloseTo(0.5, 1);
  });
  it("caps catchup and preserves fractional steps", () => {
    const a = new Accumulator();
    let steps = 0;
    const step = () => steps++;
    expect(a.advance(1 / 120, step)).toBe(0);
    expect(a.advance(1 / 120, step)).toBe(1);
    expect(a.advance(10, step)).toBe(4);
    expect(steps).toBe(5);
    expect(a.remainder).toBe(0);
  });
});
