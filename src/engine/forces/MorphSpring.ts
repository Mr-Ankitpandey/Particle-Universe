import type { ParticleBuffer } from "../core/ParticleBuffer";
export class MorphSpring {
  remaining = 0;
  hold = false;
  apply(b: ParticleBuffer, dt: number) {
    if (this.remaining <= 0 && !this.hold) return;
    this.remaining = Math.max(0, this.remaining - dt);
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy;
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 1) continue;
      const delay = ((i % 97) / 97) * 0.22;
      const stiffness = this.remaining > 1.2 - delay ? 10 : 38;
      vx[i] =
        (vx[i] ?? 0) +
        ((b.hx[i] ?? 0) - (x[i] ?? 0)) * stiffness * dt -
        (vx[i] ?? 0) * 10 * dt;
      vy[i] =
        (vy[i] ?? 0) +
        ((b.hy[i] ?? 0) - (y[i] ?? 0)) * stiffness * dt -
        (vy[i] ?? 0) * 10 * dt;
    }
  }
}
