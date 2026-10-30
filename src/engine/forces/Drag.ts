import { DRAG_RATE } from "../core/constants";
import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
export class Drag implements Force {
  rate = DRAG_RATE;
  readonly id = "drag";
  enabled = true;
  apply(b: ParticleBuffer, dt: number) {
    const damping = Math.exp(-this.rate * dt);
    for (let i = 0; i < b.count; i++) {
      b.vx[i] = (b.vx[i] ?? 0) * damping;
      b.vy[i] = (b.vy[i] ?? 0) * damping;
    }
  }
}
