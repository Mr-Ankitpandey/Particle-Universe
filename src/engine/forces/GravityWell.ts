import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { EntityManager } from "../entities/EntityManager";
export class GravityWell implements Force {
  readonly id = "gravity-wells";
  enabled = true;
  constructor(private entities: EntityManager) {}
  apply(b: ParticleBuffer, dt: number) {
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy;
    for (let e = 0; e < this.entities.items.length; e++) {
      const entity = this.entities.items[e];
      if (!entity || entity.kind !== "gravityWell") continue;
      for (let i = 0; i < b.count; i++) {
        if ((b.flags[i] ?? 0) & 1 || (b.visibility[i] ?? 1) <= 0.001) continue;
        const dx = entity.x - (x[i] ?? 0),
          dy = entity.y - (y[i] ?? 0),
          d2 = dx * dx + dy * dy;
        if (d2 > entity.radius * entity.radius * 9) continue;
        const force = (entity.strength * dt) / (d2 + 0.04);
        vx[i] = (vx[i] ?? 0) + dx * force;
        vy[i] = (vy[i] ?? 0) + dy * force;
      }
    }
  }
}
