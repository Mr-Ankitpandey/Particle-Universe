import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { EntityManager } from "../entities/EntityManager";
export class Vortex implements Force {
  readonly id = "vortices";
  enabled = true;
  constructor(private entities: EntityManager) {}
  apply(b: ParticleBuffer, dt: number) {
    for (let e = 0; e < this.entities.items.length; e++) {
      const entity = this.entities.items[e];
      if (!entity || entity.kind !== "vortex") continue;
      for (let i = 0; i < b.count; i++) {
        if ((b.flags[i] ?? 0) & 1) continue;
        const dx = (b.x[i] ?? 0) - entity.x,
          dy = (b.y[i] ?? 0) - entity.y,
          d = Math.hypot(dx, dy);
        if (d > entity.radius * 2 || d < 0.001) continue;
        const force =
          ((entity.strength * (1 - d / (entity.radius * 2)) * dt) / d) *
          (entity.clockwise ? 1 : -1);
        b.vx[i] = (b.vx[i] ?? 0) - dy * force;
        b.vy[i] = (b.vy[i] ?? 0) + dx * force;
      }
    }
  }
}
