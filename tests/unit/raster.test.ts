import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ParticleLayer } from "../../src/engine/render/layers/ParticleLayer";
import { ParticleBuffer } from "../../src/engine/core/ParticleBuffer";
let frame: { data: Uint8ClampedArray };
beforeEach(() => {
  vi.stubGlobal(
    "ImageData",
    class {
      readonly data: Uint8ClampedArray;
      constructor(
        public width: number,
        public height: number,
      ) {
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    },
  );
  vi.stubGlobal(
    "OffscreenCanvas",
    class {
      constructor(
        public width: number,
        public height: number,
      ) {}
      getContext() {
        return {
          putImageData: (pixels: { data: Uint8ClampedArray }) => {
            frame = pixels;
          },
        };
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());
it("adds coincident stars and reuses the raster buffer across frames", () => {
  const layer = new ParticleLayer();
  layer.resize(16, 16);
  const particles = new ParticleBuffer(2);
  particles.size.fill(0.7);
  particles.hue.fill(210);
  particles.count = 1;
  layer.render(particles, 1, 8.2, 8.2, 1);
  const original = frame.data,
    brightness = original.reduce(
      (sum, value, i) => sum + (i % 4 === 3 ? 0 : value),
      0,
    );
  particles.count = 2;
  layer.render(particles, 1, 8.2, 8.2, 1);
  expect(frame.data).toBe(original);
  expect(
    frame.data.reduce((sum, value, i) => sum + (i % 4 === 3 ? 0 : value), 0),
  ).toBeGreaterThan(brightness);
});
it("clears old star positions and clips offscreen particles safely", () => {
  const layer = new ParticleLayer();
  layer.resize(16, 16);
  const particles = new ParticleBuffer(1);
  particles.size[0] = 1;
  layer.render(particles, 1, 8, 8, 1);
  expect(frame.data.some((v) => v > 0)).toBe(true);
  particles.x[0] = -100;
  layer.render(particles, 1, 8, 8, 1);
  expect(frame.data.every((v) => v === 0)).toBe(true);
});
