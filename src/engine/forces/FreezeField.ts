import type { Force } from "./Force";
import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { PointerSource } from "../../input/tools";
export class FreezeField implements Force {
  readonly id = "freeze";
  enabled = true;
  constructor(private sources: PointerSource[]) {}
  apply(b: ParticleBuffer) {
    for (let p = 0; p < this.sources.length; p++) {
      const source = this.sources[p];
      if (!source?.active || source.tool !== "freeze") continue;
      for (let i = 0; i < b.count; i++) {
        if (
          Math.hypot((b.x[i] ?? 0) - source.x, (b.y[i] ?? 0) - source.y) >
          source.radius
        )
          continue;
        if (source.unfreeze) {
          b.flags[i] = (b.flags[i] ?? 0) & ~1;
        } else {
          b.flags[i] = (b.flags[i] ?? 0) | 1;
          b.vx[i] = 0;
          b.vy[i] = 0;
        }
      }
    }
  }
  thaw(b: ParticleBuffer) {
    let found = false;
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 1) {
        found = true;
        b.flags[i] = (b.flags[i] ?? 0) & ~1;
        b.vx[i] = -(b.y[i] ?? 0) * 0.02;
        b.vy[i] = (b.x[i] ?? 0) * 0.02;
      }
    }
    return found;
  }
}
