import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
export class Drag implements Force {
  readonly id = "drag";
  enabled = true;
  apply(b: ParticleBuffer, dt: number) {
    const damping = Math.exp(-5 * dt);
    for (let i = 0; i < b.count; i++) {
      b.vx[i] = (b.vx[i] ?? 0) * damping;
      b.vy[i] = (b.vy[i] ?? 0) * damping;
    }
  }
}
