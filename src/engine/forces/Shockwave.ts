import type { ParticleBuffer } from "../core/ParticleBuffer";
import type { Force } from "./Force";
const CAPACITY = 24,
  SPEED = 2,
  LIFETIME = 1.2;
export class Shockwave implements Force {
  readonly id = "shockwave";
  enabled = true;
  readonly x = new Float32Array(CAPACITY);
  readonly y = new Float32Array(CAPACITY);
  readonly age = new Float32Array(CAPACITY).fill(-1);
  readonly strength = new Float32Array(CAPACITY);
  private cursor = 0;
  spawn(x: number, y: number, strength = 1) {
    const i = this.cursor++ % CAPACITY;
    this.x[i] = x;
    this.y[i] = y;
    this.age[i] = 0;
    this.strength[i] = strength;
  }
  apply(b: ParticleBuffer, dt: number) {
    const x = b.x,
      y = b.y,
      vx = b.vx,
      vy = b.vy;
    for (let wave = 0; wave < CAPACITY; wave++) {
      const age = this.age[wave] ?? -1;
      if (age < 0) continue;
      const next = age + dt;
      this.age[wave] = next > LIFETIME ? -1 : next;
      const inner = Math.max(0, age * SPEED),
        outer = next * SPEED,
        cx = this.x[wave] ?? 0,
        cy = this.y[wave] ?? 0,
        strength = (this.strength[wave] ?? 1) * 0.12;
      for (let i = 0; i < b.count; i++) {
        const dx = (x[i] ?? 0) - cx,
          dy = (y[i] ?? 0) - cy,
          d = Math.hypot(dx, dy);
        if (d > inner && d <= outer) {
          const impulse = strength / Math.max(0.01, d) / (1 + d);
          vx[i] = (vx[i] ?? 0) + dx * impulse;
          vy[i] = (vy[i] ?? 0) + dy * impulse;
        }
      }
    }
  }
}
