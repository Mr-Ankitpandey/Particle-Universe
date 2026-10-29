import { ParticleBuffer } from "./core/ParticleBuffer";
import { Simulation } from "./core/Simulation";
import { Loop } from "./core/Loop";
import { galaxy } from "./generators/galaxy";
import { Renderer } from "./render/Renderer";
export class Engine {
  readonly buffer = new ParticleBuffer(20000);
  private simulation = new Simulation(this.buffer);
  private renderer: Renderer;
  private loop: Loop;
  constructor(canvas: HTMLCanvasElement, background: HTMLCanvasElement) {
    galaxy(this.buffer, 4217);
    this.renderer = new Renderer(canvas, background);
    this.loop = new Loop(
      (dt) => this.simulation.step(dt),
      (time) => this.renderer.render(this.buffer, time),
    );
  }
  resize(w: number, h: number, dpr: number) {
    this.renderer.resize(w, h, dpr);
  }
  start() {
    this.loop.start();
  }
  getStats() {
    return {
      fps: this.loop.fps,
      frameMs: this.loop.frameMs,
      particleCount: this.buffer.count,
      qualityTier: "high",
    };
  }
  dispose() {
    this.loop.dispose();
  }
}
