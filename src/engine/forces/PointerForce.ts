import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { PointerSource } from "../../input/tools";
import type { Force } from "./Force";
const STRENGTH = 0.22,
  MOMENTUM = 0.06;
export class PointerForce implements Force {
  readonly id = "pointer";
  enabled = true;
  constructor(readonly sources: PointerSource[]) {}
  apply(b: ParticleBuffer, dt: number) {
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy;
    for (let p = 0; p < this.sources.length; p++) {
      const source = this.sources[p];
      if (
        !source?.active ||
        source.tool === "pan" ||
        source.tool === "shockwave"
      )
        continue;
      for (let i = 0; i < b.count; i++) {
        const dx = source.x - (x[i] ?? 0),
          dy = source.y - (y[i] ?? 0),
          d2 = dx * dx + dy * dy;
        if (d2 > source.radius * source.radius || d2 < 0.000001) continue;
        const d = Math.sqrt(d2),
          falloff = (1 - d / source.radius) ** 2,
          force = (STRENGTH * falloff * dt) / d;
        let ax = dx,
          ay = dy;
        if (source.tool === "repel") {
          ax = -dx - dy * 0.2;
          ay = -dy + dx * 0.2;
        } else if (source.tool === "swirl") {
          ax = -dy;
          ay = dx;
        }
        vx[i] = (vx[i] ?? 0) + ax * force + source.vx * MOMENTUM * falloff * dt;
        vy[i] = (vy[i] ?? 0) + ay * force + source.vy * MOMENTUM * falloff * dt;
      }
    }
  }
}
