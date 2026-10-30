import type { Force, SimContext } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
import { angularSpeed, IGNITION_SECONDS } from "../core/constants";
// Critically damped ignition gives way to enclosed-mass circular orbits.
const IGNITION_STIFFNESS = 16,
  IGNITION_DAMPING = 8;
export class OrbitalForce implements Force {
  gravity = 1;
  rotationSpeed = 1;
  drag = 0.03;
  readonly id = "orbit";
  enabled = true;
  apply(b: ParticleBuffer, dt: number, ctx: SimContext) {
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy,
      hx = b.hx,
      hy = b.hy;
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 1 || (b.visibility[i] ?? 1) <= 0.001) continue;
      const px = x[i] ?? 0,
        py = y[i] ?? 0;
      if (ctx.time < IGNITION_SECONDS) {
        vx[i] =
          (vx[i] ?? 0) +
          ((hx[i] ?? 0) - px) * IGNITION_STIFFNESS * dt -
          (vx[i] ?? 0) * IGNITION_DAMPING * dt;
        vy[i] =
          (vy[i] ?? 0) +
          ((hy[i] ?? 0) - py) * IGNITION_STIFFNESS * dt -
          (vy[i] ?? 0) * IGNITION_DAMPING * dt;
      } else {
        const speed =
            angularSpeed(px * px + py * py) *
            Math.sqrt(this.gravity) *
            this.rotationSpeed,
          acceleration = speed * speed;
        // Replenish only the circular component lost to drag; user impulses still dissipate.
        vx[i] =
          (vx[i] ?? 0) + (-px * acceleration - py * speed * this.drag) * dt;
        vy[i] =
          (vy[i] ?? 0) + (-py * acceleration + px * speed * this.drag) * dt;
      }
    }
  }
}
