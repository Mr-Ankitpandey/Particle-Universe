import { ParticleBuffer } from "./core/ParticleBuffer";
import { Simulation } from "./core/Simulation";
import { Loop } from "./core/Loop";
import { galaxy } from "./generators/galaxy";
import { Renderer } from "./render/Renderer";
import { Camera } from "./core/Camera";
import { InputController } from "../input/InputController";
import { EffectsLayer } from "./render/layers/EffectsLayer";
import { EntityManager } from "./entities/EntityManager";
import { PerformanceGovernor } from "./core/PerformanceGovernor";
import { sceneStore, updateScene } from "../state/store";
import { defaultScene } from "../scene/defaults";
import { sceneSchema, type SceneConfig } from "../scene/schema";
import type { ToolId } from "../input/tools";
export class Engine {
  readonly buffer = new ParticleBuffer(60000);
  readonly camera = new Camera();
  readonly input: InputController;
  readonly entities: EntityManager;
  private target = new ParticleBuffer(60000);
  private simulation: Simulation;
  private renderer: Renderer;
  private loop: Loop;
  private effects: EffectsLayer;
  private effectsContext: CanvasRenderingContext2D;
  private governor = new PerformanceGovernor();
  private requestedDpr = 1;
  private appliedDpr = 1;
  private scene: SceneConfig = defaultScene;
  private initialized = false;
  private geometry = "";
  private colors = "";
  private previousFrame = 0;
  private nextBurst = 6;
  private unsubscribe: () => void;
  constructor(
    canvas: HTMLCanvasElement,
    background: HTMLCanvasElement,
    private overlay: HTMLCanvasElement,
    nebula: HTMLCanvasElement,
    bloom: HTMLCanvasElement,
    notify: (message: string) => void = () => {},
  ) {
    this.buffer.count = 0;
    this.entities = new EntityManager(notify);
    this.renderer = new Renderer(canvas, background, nebula, bloom);
    this.input = new InputController(
      canvas,
      this.camera,
      {
        commitEntities: () =>
          updateScene((config) => {
            config.entities = this.entities.export();
          }, true),
        shouldThaw: (x, y, radius) => {
          for (let i = 0; i < this.buffer.count; i++)
            if (
              (this.buffer.flags[i] ?? 0) & 1 &&
              Math.hypot(
                (this.buffer.x[i] ?? 0) - x,
                (this.buffer.y[i] ?? 0) - y,
              ) < radius
            )
              return true;
          return false;
        },
        shockwave: (x, y) => this.simulation.waves.spawn(x, y),
        supernova: (x, y, charge) =>
          this.simulation.supernova.explode(
            this.buffer,
            x,
            y,
            charge,
            this.simulation.time,
          ),
      },
      this.entities,
    );
    this.simulation = new Simulation(
      this.buffer,
      this.input.sources,
      this.entities,
    );
    const context = overlay.getContext("2d");
    if (!context) throw Error("Canvas 2D unavailable");
    this.effectsContext = context;
    this.effects = new EffectsLayer(context);
    this.loop = new Loop(
      (dt) => {
        this.simulation.step(dt * this.scene.physics.timeScale);
        if (
          this.scene.behaviors.onIdle === "pulse" &&
          this.scene.behaviors.onClick === "supernova" &&
          this.simulation.time > this.nextBurst
        ) {
          this.simulation.supernova.explode(
            this.buffer,
            0,
            0,
            1.3,
            this.simulation.time,
          );
          this.nextBurst = this.simulation.time + 6;
        }
      },
      (time) => this.render(time),
    );
    this.applyScene(sceneStore.getState().config, { transition: "cut" });
    this.governor.lock = sceneStore.getState().quality;
    this.unsubscribe = sceneStore.subscribe((state, previous) => {
      if (state.config !== previous.config) this.applyScene(state.config);
      this.governor.lock = state.quality;
    });
  }
  private render(time: number) {
    const start = performance.now(),
      dt = this.previousFrame
        ? Math.min(0.1, time - this.previousFrame)
        : 1 / 60;
    this.previousFrame = time;
    const fraction = this.governor.fraction,
      configured = this.scene.galaxy.particleCount;
    for (let i = 0; i < this.buffer.count; i++) {
      const target =
          i < configured && (i * 0.61803398875) % 1 < fraction ? 1 : 0,
        alpha = this.buffer.visibility[i] ?? 1;
      this.buffer.visibility[i] =
        alpha + Math.max(-dt / 0.3, Math.min(dt / 0.3, target - alpha));
      if (this.scene.appearance.colorMode === "velocity")
        this.buffer.hue[i] =
          180 +
          Math.min(
            150,
            Math.hypot(this.buffer.vx[i] ?? 0, this.buffer.vy[i] ?? 0) * 240,
          );
    }
    if (this.simulation.morph.remaining <= 0 && this.buffer.count > configured)
      this.buffer.count = configured;
    const nextDpr = Math.min(this.requestedDpr, this.governor.maxDpr);
    if (nextDpr !== this.appliedDpr)
      this.resize(this.camera.width, this.camera.height, this.requestedDpr);
    this.renderer.bloom =
      this.governor.tier === "low"
        ? 0
        : this.scene.appearance.bloom *
          (this.governor.tier === "medium" ? 0.5 : 1);
    this.renderer.quality = this.governor.tier;
    this.renderer.render(this.buffer, time, this.camera);
    this.effects.render(
      this.camera,
      this.simulation.waves,
      this.input.sources,
      time * 1000,
      this.entities,
    );
    this.governor.update(
      dt * 1000,
      dt,
      performance.now() - start + this.loop.simulationMs,
    );
  }
  applyScene(value: SceneConfig, opts?: { transition?: "morph" | "cut" }) {
    const cfg = sceneSchema.parse(value),
      key = JSON.stringify({
        seed: cfg.seed,
        galaxy: { ...cfg.galaxy, rotationSpeed: 0 },
      }),
      layout = key !== this.geometry,
      oldCount = this.buffer.count;
    const colors = JSON.stringify([cfg.appearance.palette, cfg.appearance.particleSize, cfg.appearance.sizeVariance, cfg.appearance.colorMode]);
    const recolor = colors !== this.colors;
    this.target.count = cfg.galaxy.particleCount;
    if (layout || recolor) galaxy(this.target, cfg.seed, cfg);
    if (layout) {
      this.buffer.count = Math.max(oldCount, this.target.count);
      for (let i = 0; i < this.buffer.count; i++) {
        if (i < this.target.count) {
          this.buffer.hx[i] = this.target.hx[i] ?? 0;
          this.buffer.hy[i] = this.target.hy[i] ?? 0;
          if (!this.initialized || i >= oldCount) {
            this.buffer.x[i] = this.target.x[i] ?? 0;
            this.buffer.y[i] = this.target.y[i] ?? 0;
            this.buffer.visibility[i] = this.initialized ? 0 : 1;
          }
          this.buffer.flags[i] = this.target.flags[i] ?? 0;
        } else {
          this.buffer.hx[i] = this.buffer.x[i] ?? 0;
          this.buffer.hy[i] = this.buffer.y[i] ?? 0;
        }
      }
      if (this.initialized && opts?.transition !== "cut") {
        this.simulation.morph.remaining = 1.2;
        this.simulation.time = Math.max(3, this.simulation.time);
      } else if (this.initialized) {
        this.buffer.x.set(this.buffer.hx);
        this.buffer.y.set(this.buffer.hy);
        this.simulation.time = 3;
      }
      this.geometry = key;
    }
    for (let i = 0; (layout || recolor) && i < this.target.count; i++) {
      this.buffer.hue[i] = this.target.hue[i] ?? 0;
      this.buffer.sat[i] = this.target.sat[i] ?? 0.75;
      this.buffer.lum[i] = this.target.lum[i] ?? 0.78;
      this.buffer.size[i] = this.target.size[i] ?? 1;
    }
    this.colors = colors;
    if (
      JSON.stringify(cfg.entities) !== JSON.stringify(this.scene.entities) ||
      !this.initialized
    )
      this.entities.apply(cfg.entities);
    const sim = this.simulation;
    sim.orbit.gravity = cfg.physics.gravity;
    sim.orbit.rotationSpeed = cfg.galaxy.rotationSpeed;
    sim.orbit.drag = cfg.physics.drag;
    sim.drag.rate = cfg.physics.drag;
    sim.pointers.strength = cfg.physics.pointerStrength;
    sim.pointers.enabled = cfg.physics.pointerMode !== "off";
    if (
      cfg.physics.pointerMode !== "off" &&
      cfg.physics.pointerMode !== this.scene.physics.pointerMode
    )
      this.input.tool = cfg.physics.pointerMode;
    this.input.radius = cfg.physics.pointerRadius;
    sim.flow.enabled = cfg.physics.flowField.enabled;
    sim.flow.strength = cfg.physics.flowField.strength;
    sim.flow.scale = cfg.physics.flowField.scale;
    sim.flow.evolveSpeed = cfg.physics.flowField.evolveSpeed;
    sim.turbulence.enabled = cfg.physics.turbulence > 0;
    sim.turbulence.strength = cfg.physics.turbulence;
    sim.turbulence.scale = cfg.physics.turbulenceScale;
    this.renderer.configure(cfg);
    this.scene = cfg;
    this.initialized = true;
  }
  resize(w: number, h: number, dpr: number) {
    this.requestedDpr = dpr;
    this.appliedDpr = Math.min(dpr, this.governor.maxDpr);
    this.camera.resize(w, h);
    this.renderer.resize(w, h, this.appliedDpr);
    this.overlay.width = w * this.appliedDpr;
    this.overlay.height = h * this.appliedDpr;
    this.effectsContext.setTransform(
      this.appliedDpr,
      0,
      0,
      this.appliedDpr,
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
    if (!this.simulation.freeze.thaw(this.buffer)) this.loop.togglePause();
  }
  step() {
    this.loop.stepFrame();
  }
  getScene() {
    return { ...structuredClone(this.scene), entities: this.entities.export() };
  }
  getStats() {
    return {
      fps: this.loop.fps,
      frameMs: this.loop.frameMs,
      particleCount: Math.round(
        this.scene.galaxy.particleCount * this.governor.fraction,
      ),
      configuredCount: this.scene.galaxy.particleCount,
      qualityTier: this.governor.tier,
      paused: this.loop.isPaused,
      entityCount: this.entities.items.length,
    };
  }
  dispose() {
    this.unsubscribe();
    this.loop.dispose();
    this.input.dispose();
  }
}
