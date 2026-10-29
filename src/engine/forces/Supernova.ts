import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { Shockwave } from "./Shockwave";
export class Supernova {
  private last = -10;
  constructor(private waves: Shockwave) {}
  explode(
    b: ParticleBuffer,
    x: number,
    y: number,
    charge: number,
    time: number,
  ) {
    if (time - this.last < 0.4) return;
    this.last = time;
    const strength = 1 + Math.min(1.5, charge) * 2;
    this.waves.spawn(x, y, strength);
    const debris = Math.min(192, b.count);
    for (let i = 0; i < debris; i++) {
      const index = b.count - 1 - i,
        angle = i * 2.3999632297;
      b.x[index] = x + Math.cos(angle) * 0.02;
      b.y[index] = y + Math.sin(angle) * 0.02;
      b.vx[index] = Math.cos(angle) * strength * 0.32;
      b.vy[index] = Math.sin(angle) * strength * 0.32;
      b.life[index] = 3;
      b.flags[index] = 2;
      b.hue[index] = 45;
    }
  }
}
