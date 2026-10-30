import { MorphSpring } from "../forces/MorphSpring";
import type { EntityManager } from "../entities/EntityManager";
import { GravityWell } from "../forces/GravityWell";
import { BlackHole } from "../forces/BlackHole";
import { Vortex } from "../forces/Vortex";
import { FreezeField } from "../forces/FreezeField";
import { FlowField } from "../forces/FlowField";
import { Turbulence } from "../forces/Turbulence";
import { Shockwave } from "../forces/Shockwave";
import { Supernova } from "../forces/Supernova";
import { PointerForce } from "../forces/PointerForce";
import type { PointerSource } from "../../input/tools";
import { angularSpeed, IGNITION_SECONDS } from "./constants";
import { ParticleBuffer } from "./ParticleBuffer";
import { OrbitalForce } from "../forces/OrbitalForce";
import { Drag } from "../forces/Drag";
export class Simulation {
  readonly morph = new MorphSpring();
  readonly orbit = new OrbitalForce();
  readonly drag = new Drag();
  readonly waves = new Shockwave();
  readonly supernova = new Supernova(this.waves);
  readonly pointers: PointerForce;
  readonly freeze: FreezeField;
  readonly flow = new FlowField();
  readonly turbulence = new Turbulence();
  private wells?: GravityWell;
  private holes?: BlackHole;
  private vortices?: Vortex;
  time = 0;
  constructor(
    readonly buffer: ParticleBuffer,
    sources: PointerSource[] = [],
    entities?: EntityManager,
  ) {
    this.pointers = new PointerForce(sources);
    this.freeze = new FreezeField(sources);
    if (entities) {
      this.wells = new GravityWell(entities);
      this.holes = new BlackHole(entities);
      this.vortices = new Vortex(entities);
    }
  }
  step(dt: number) {
    const b = this.buffer;
    const previous = this.time;
    this.time += dt;
    if (previous < IGNITION_SECONDS && this.time >= IGNITION_SECONDS) {
      for (let i = 0; i < b.count; i++) {
        const x = b.x[i] ?? 0,
          y = b.y[i] ?? 0,
          speed =
            angularSpeed(x * x + y * y) *
            Math.sqrt(this.orbit.gravity) *
            this.orbit.rotationSpeed;
        b.vx[i] = -y * speed;
        b.vy[i] = x * speed;
      }
    }
    this.freeze.apply(b);
    if (this.morph.remaining <= 0 && !this.morph.hold)
      this.orbit.apply(b, dt, this);
    this.wells?.apply(b, dt);
    this.holes?.apply(b, dt);
    this.vortices?.apply(b, dt);
    this.flow.apply(b, dt, this);
    this.turbulence.apply(b, dt, this);
    this.pointers.apply(b, dt);
    this.waves.apply(b, dt);
    const wasMorphing = this.morph.remaining > 0;
    this.morph.apply(b, dt);
    if (wasMorphing && this.morph.remaining === 0 && !this.morph.hold) {
      // Restore circular momentum after gathering; a spring otherwise leaves
      // stars nearly stationary and the next gravity step collapses the scene.
      for (let i = 0; i < b.count; i++) {
        if ((b.flags[i] ?? 0) & 1) continue;
        const x = b.x[i] ?? 0,
          y = b.y[i] ?? 0;
        const speed =
          angularSpeed(x * x + y * y) *
          Math.sqrt(this.orbit.gravity) *
          this.orbit.rotationSpeed;
        b.vx[i] = -y * speed;
        b.vy[i] = x * speed;
      }
    }
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 1 || (b.visibility[i] ?? 1) <= 0.001) continue;
      b.px[i] = b.x[i] ?? 0;
      b.py[i] = b.y[i] ?? 0;
      b.x[i] = (b.x[i] ?? 0) + (b.vx[i] ?? 0) * dt;
      b.y[i] = (b.y[i] ?? 0) + (b.vy[i] ?? 0) * dt;
    }
    this.drag.apply(b, dt);
    for (let i = 0; i < b.count; i++) {
      if ((b.flags[i] ?? 0) & 2) {
        b.life[i] = (b.life[i] ?? 0) - dt;
        b.hue[i] = 45 + (3 - (b.life[i] ?? 0)) * 80;
        if ((b.life[i] ?? 0) <= 0) {
          b.flags[i] = 0;
          b.life[i] = Infinity;
          b.hue[i] = 240;
        }
      }
      const x = b.x[i] ?? 0,
        y = b.y[i] ?? 0;
      if (x * x + y * y > 1.44) {
        b.vx[i] = ((b.vx[i] ?? 0) - x * 0.25 * dt) * Math.exp(-0.7 * dt);
        b.vy[i] = ((b.vy[i] ?? 0) - y * 0.25 * dt) * Math.exp(-0.7 * dt);
      }
      if (x * x + y * y > 36) {
        const angle = i * 2.3999632297;
        b.x[i] = b.hx[i] ?? Math.cos(angle);
        b.y[i] = b.hy[i] ?? Math.sin(angle);
        const speed = angularSpeed(1);
        b.vx[i] = -Math.sin(angle) * speed;
        b.vy[i] = Math.cos(angle) * speed;
      }
    }
  }
}
