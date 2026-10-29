import { Rng } from "../core/Rng";
import { ParticleBuffer } from "../core/ParticleBuffer";
export function galaxy(b: ParticleBuffer, seed: number) {
  const rng = new Rng(seed);
  for (let i = 0; i < b.count; i++) {
    const core = rng.next() < 0.15;
    const r = core
      ? Math.abs(rng.gaussian()) * 0.085
      : Math.min(1.05, -Math.log(Math.max(0.001, 1 - rng.next())) * 0.32);
    const angle = core
      ? rng.next() * Math.PI * 2
      : ((i % 4) * Math.PI) / 2 + r * 7 + rng.gaussian() * 0.35;
    const scatter = 0.012 + r * 0.045;
    const x = Math.cos(angle) * r + rng.gaussian() * scatter,
      y = Math.sin(angle) * r + rng.gaussian() * scatter;
    b.hx[i] = x;
    b.hy[i] = y;
    b.x[i] = x * 2.7 + rng.gaussian() * 0.25;
    b.y[i] = y * 2.7 + rng.gaussian() * 0.25;
    b.hue[i] = core ? 35 : 210 + Math.min(1, r) * 83 + rng.next() * 8;
    b.sat[i] = core ? 0.25 : 0.72;
    b.lum[i] = 0.7;
    b.size[i] = 0.55 + rng.next() * 0.85 + (rng.next() > 0.99 ? 1.6 : 0);
  }
}
