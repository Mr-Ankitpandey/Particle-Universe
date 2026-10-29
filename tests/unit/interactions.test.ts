import { expect, it } from "vitest";
import { Camera } from "../../src/engine/core/Camera";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
import { Shockwave } from "../../src/engine/forces/Shockwave";
import { Supernova } from "../../src/engine/forces/Supernova";
it("keeps the cursor world coordinate fixed when zooming and clamps zoom", () => {
  const c = new Camera();
  c.resize(1440, 900);
  c.panX = 80;
  c.panY = -30;
  const before = { x: 0, y: 0 },
    after = { x: 0, y: 0 };
  c.screenToWorld(400, 300, before);
  c.zoomAt(2, 400, 300);
  c.screenToWorld(400, 300, after);
  expect(after.x).toBeCloseTo(before.x, 8);
  expect(after.y).toBeCloseTo(before.y, 8);
  c.zoomAt(100, 400, 300);
  expect(c.zoom).toBe(4);
  c.zoomAt(0.0001, 400, 300);
  expect(c.zoom).toBe(0.25);
});
it("a passing shockwave transfers outward momentum", () => {
  const b = new ParticleBuffer(1);
  b.x[0] = 0.2;
  const wave = new Shockwave();
  wave.spawn(0, 0);
  for (let i = 0; i < 8; i++) wave.apply(b, 1 / 60);
  expect(b.vx[0]).toBeGreaterThan(0);
  expect(b.vy[0]).toBe(0);
});
it("supernova recycles existing particles and rate-limits repeated bursts", () => {
  const b = new ParticleBuffer(1000),
    wave = new Shockwave(),
    supernova = new Supernova(wave);
  supernova.explode(b, 0, 0, 1.5, 10);
  supernova.explode(b, 0, 0, 1.5, 10.1);
  expect(b.count).toBe(1000);
  expect(Array.from(wave.age).filter((age) => age >= 0)).toHaveLength(1);
  expect(b.flags[999]).toBe(2);
});
