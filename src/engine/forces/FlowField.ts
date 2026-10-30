import { createNoise3D } from "simplex-noise";
import { Rng } from "../core/Rng";
import type { Force, SimContext } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
const GRID = 48,
  EXTENT = 3,
  EPSILON = 0.025;
export class FlowField implements Force {
  readonly id = "flow";
  enabled = false;
  strength = 0.08;
  scale = 1.2;
  evolveSpeed = 0.12;
  private noise: ReturnType<typeof createNoise3D>;
  private fx = new Float32Array(GRID * GRID);
  private fy = new Float32Array(GRID * GRID);
  private lastUpdate = -1;
  constructor(seed = 4217) {
    const rng = new Rng(seed);
    this.noise = createNoise3D(() => rng.next());
  }
  apply(b: ParticleBuffer, dt: number, ctx: SimContext) {
    if (!this.enabled) return;
    const time = ctx.time * this.evolveSpeed;
    if (ctx.time - this.lastUpdate > 0.1) {
      this.lastUpdate = ctx.time;
      for (let row = 0; row < GRID; row++)
        for (let col = 0; col < GRID; col++) {
          const x = ((col / (GRID - 1)) * 2 - 1) * EXTENT * this.scale,
            y = ((row / (GRID - 1)) * 2 - 1) * EXTENT * this.scale,
            index = row * GRID;
          this.fx[index + col] =
            (this.noise(x, y + EPSILON, time) -
              this.noise(x, y - EPSILON, time)) /
            (2 * EPSILON);
          this.fy[index + col] =
            -(
              this.noise(x + EPSILON, y, time) -
              this.noise(x - EPSILON, y, time)
            ) /
            (2 * EPSILON);
        }
    }
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 1 || (b.visibility[i] ?? 1) <= 0.001) continue;
      const gx = ((b.x[i] ?? 0) / EXTENT + 1) * 0.5 * (GRID - 1),
        gy = ((b.y[i] ?? 0) / EXTENT + 1) * 0.5 * (GRID - 1);
      const col = Math.max(0, Math.min(GRID - 2, Math.floor(gx))),
        row = Math.max(0, Math.min(GRID - 2, Math.floor(gy))),
        tx = Math.max(0, Math.min(1, gx - col)),
        ty = Math.max(0, Math.min(1, gy - row)),
        index = row * GRID + col;
      const ax =
        (this.fx[index] ?? 0) * (1 - tx) * (1 - ty) +
        (this.fx[index + 1] ?? 0) * tx * (1 - ty) +
        (this.fx[index + GRID] ?? 0) * (1 - tx) * ty +
        (this.fx[index + GRID + 1] ?? 0) * tx * ty;
      const ay =
        (this.fy[index] ?? 0) * (1 - tx) * (1 - ty) +
        (this.fy[index + 1] ?? 0) * tx * (1 - ty) +
        (this.fy[index + GRID] ?? 0) * (1 - tx) * ty +
        (this.fy[index + GRID + 1] ?? 0) * tx * ty;
      b.vx[i] = (b.vx[i] ?? 0) + ax * this.strength * dt;
      b.vy[i] = (b.vy[i] ?? 0) + ay * this.strength * dt;
    }
  }
}
