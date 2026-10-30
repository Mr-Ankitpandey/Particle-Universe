import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { EntityManager } from "../entities/EntityManager";
import { angularSpeed } from "../core/constants";
export class BlackHole implements Force {
  readonly id = "black-holes";
  enabled = true;
  private sequence = 0;
  constructor(private entities: EntityManager) {}
  apply(b: ParticleBuffer, dt: number) {
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy;
    for (let e = 0; e < this.entities.items.length; e++) {
      const entity = this.entities.items[e];
      if (!entity || entity.kind !== "blackHole") continue;
      entity.mass = Math.max(0.4, entity.mass - dt * 0.002);
      const horizon = 0.035 * Math.sqrt(entity.mass);
      for (let i = 0; i < b.count; i++) {
        if ((b.flags[i] ?? 0) & 1 || (b.visibility[i] ?? 1) <= 0.001) continue;
        const dx = entity.x - (x[i] ?? 0),
          dy = entity.y - (y[i] ?? 0),
          d = Math.hypot(dx, dy);
        if (d < horizon) {
          const angle = (i + this.sequence++) * 2.3999632297,
            r = 0.8 + ((i * 17) % 100) * 0.004;
          x[i] = Math.cos(angle) * r;
          y[i] = Math.sin(angle) * r;
          const speed = angularSpeed(r * r);
          vx[i] = -(y[i] ?? 0) * speed;
          vy[i] = (x[i] ?? 0) * speed;
          b.hue[i] = 230 + (i % 45);
          b.px[i] = x[i] ?? 0;
          b.py[i] = y[i] ?? 0;
          entity.mass = Math.min(4, entity.mass + 0.00003);
          continue;
        }
        const force = (0.035 * entity.mass * dt) / (d * d + 0.005);
        vx[i] = (vx[i] ?? 0) + dx * force;
        vy[i] = (vy[i] ?? 0) + dy * force;
        if (d < horizon * 5) b.hue[i] = 20 + (d / (horizon * 5)) * 22;
      }
    }
  }
}
