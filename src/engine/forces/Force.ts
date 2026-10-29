import type { ParticleBuffer } from "../core/ParticleBuffer";
export interface SimContext {
  time: number;
}
export interface Force {
  readonly id: string;
  enabled: boolean;
  apply(buf: ParticleBuffer, dt: number, ctx: SimContext): void;
}
