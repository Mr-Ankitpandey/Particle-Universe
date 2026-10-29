import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
// Angular speed in radians/second; solid rotation preserves the spiral silhouette.
const SPEED = 0.045;
export class OrbitalForce implements Force {
  readonly id = "orbit";
  enabled = true;
  apply(b: ParticleBuffer, dt: number) {
    const c = Math.cos(SPEED * dt),
      s = Math.sin(SPEED * dt);
    for (let i = 0; i < b.count; i++) {
      const x = b.hx[i] ?? 0,
        y = b.hy[i] ?? 0;
      b.hx[i] = x * c - y * s;
      b.hy[i] = x * s + y * c;
      b.vx[i] = (b.vx[i] ?? 0) + ((b.hx[i] ?? 0) - (b.x[i] ?? 0)) * 9 * dt;
      b.vy[i] = (b.vy[i] ?? 0) + ((b.hy[i] ?? 0) - (b.y[i] ?? 0)) * 9 * dt;
    }
  }
}
