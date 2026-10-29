import { ParticleBuffer } from "./ParticleBuffer";
import { OrbitalForce } from "../forces/OrbitalForce";
import { Drag } from "../forces/Drag";
export class Simulation {
  readonly orbit = new OrbitalForce();
  readonly drag = new Drag();
  time = 0;
  constructor(readonly buffer: ParticleBuffer) {}
  step(dt: number) {
    const b = this.buffer;
    this.time += dt;
    this.orbit.apply(b, dt);
    for (let i = 0; i < b.count; i++) {
      b.px[i] = b.x[i] ?? 0;
      b.py[i] = b.y[i] ?? 0;
      b.x[i] = (b.x[i] ?? 0) + (b.vx[i] ?? 0) * dt;
      b.y[i] = (b.y[i] ?? 0) + (b.vy[i] ?? 0) * dt;
    }
    this.drag.apply(b, dt);
  }
}
