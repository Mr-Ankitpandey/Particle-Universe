import { ParticleBuffer } from "./core/ParticleBuffer";
import { Simulation } from "./core/Simulation";
import { Loop } from "./core/Loop";
import { galaxy } from "./generators/galaxy";
import { Renderer } from "./render/Renderer";
import { Camera } from "./core/Camera";
import { InputController } from "../input/InputController";
import { EffectsLayer } from "./render/layers/EffectsLayer";
import type { ToolId } from "../input/tools";
export class Engine {
  readonly buffer = new ParticleBuffer(20000);
  readonly camera = new Camera();
  readonly input: InputController;
  private simulation: Simulation;
  private renderer: Renderer;
  private loop: Loop;
  private effects: EffectsLayer;
  private effectsContext: CanvasRenderingContext2D;
  constructor(
    canvas: HTMLCanvasElement,
    background: HTMLCanvasElement,
    private overlay: HTMLCanvasElement,
  ) {
    galaxy(this.buffer, 4217);
    this.renderer = new Renderer(canvas, background);
    this.input = new InputController(canvas, this.camera, {
      shockwave: (x, y) => this.simulation.waves.spawn(x, y),
      supernova: (x, y, charge) =>
        this.simulation.supernova.explode(
          this.buffer,
          x,
          y,
          charge,
          this.simulation.time,
        ),
    });
    this.simulation = new Simulation(this.buffer, this.input.sources);
    const context = overlay.getContext("2d");
    if (!context) throw Error("Canvas 2D unavailable");
    this.effectsContext = context;
    this.effects = new EffectsLayer(context);
    this.loop = new Loop(
      (dt) => this.simulation.step(dt),
      (time) => {
        this.renderer.render(this.buffer, time, this.camera);
        this.effects.render(
          this.camera,
          this.simulation.waves,
          this.input.sources,
          time * 1000,
        );
      },
    );
  }
  resize(w: number, h: number, dpr: number) {
    this.camera.resize(w, h);
    this.renderer.resize(w, h, dpr);
    this.overlay.width = w * Math.min(2, dpr);
    this.overlay.height = h * Math.min(2, dpr);
    this.effectsContext.setTransform(
      Math.min(2, dpr),
      0,
      0,
      Math.min(2, dpr),
      0,
      0,
    );
  }
  start() {
    this.loop.start();
  }
  setTool(tool: ToolId) {
    this.input.tool = tool;
  }
  togglePause() {
    this.loop.togglePause();
  }
  step() {
    this.loop.stepFrame();
  }
  getStats() {
    return {
      fps: this.loop.fps,
      frameMs: this.loop.frameMs,
      particleCount: this.buffer.count,
      qualityTier: "high",
      paused: this.loop.isPaused,
    };
  }
  dispose() {
    this.loop.dispose();
    this.input.dispose();
  }
}
