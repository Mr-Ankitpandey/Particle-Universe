import type { SceneConfig } from "../../scene/schema";
import { BloomPass } from "./layers/BloomPass";
import { NebulaLayer } from "./layers/NebulaLayer";
import type { Camera } from "../core/Camera";
import { ParticleBuffer } from "../core/ParticleBuffer";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { SpriteCache } from "./SpriteCache";
import { ParticleLayer } from "./layers/ParticleLayer";
export class Renderer {
  private particles = new ParticleLayer();
  bloom = 0.12;
  glow = 0.7;
  trail = 0.74;
  nebula = true;
  streak = false;
  quality: "high" | "medium" | "low" = "high";
  private twinkle = 0;
  private parallax = 0;
  private bloomPass = new BloomPass();
  private nebulaLayer = new NebulaLayer();
  private cache = new SpriteCache();
  private ctx: CanvasRenderingContext2D;
  private bg: CanvasRenderingContext2D;
  private nebulaContext: CanvasRenderingContext2D;
  private bloomContext: CanvasRenderingContext2D;
  private backgroundLayer: BackgroundLayer;
  width = 1;
  height = 1;
  dpr = 1;
  constructor(
    private canvas: HTMLCanvasElement,
    private background: HTMLCanvasElement,
    private nebulaCanvas: HTMLCanvasElement,
    private bloomCanvas: HTMLCanvasElement,
  ) {
    const ctx = canvas.getContext("2d"),
      bg = background.getContext("2d");
    if (!ctx || !bg) throw Error("Canvas 2D unavailable");
    const nebulaContext = nebulaCanvas.getContext("2d");
    if (!nebulaContext) throw Error("Canvas unavailable");
    this.nebulaContext = nebulaContext;
    const bloomContext = bloomCanvas.getContext("2d");
    if (!bloomContext) throw Error("Canvas unavailable");
    this.bloomContext = bloomContext;
    this.ctx = ctx;
    this.bg = bg;
    this.backgroundLayer = new BackgroundLayer(bg);
  }
  resize(w: number, h: number, dpr: number) {
    this.width = w;
    this.height = h;
    this.dpr = Math.min(2, dpr);
    for (const c of [this.canvas, this.background, this.nebulaCanvas]) {
      c.width = w * this.dpr;
      c.height = h * this.dpr;
    }
    this.particles.resize(this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.bg.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.nebulaContext.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.backgroundLayer.render(w, h);
    this.bloomCanvas.width = Math.max(1, Math.floor((w * this.dpr) / 4));
    this.bloomCanvas.height = Math.max(1, Math.floor((h * this.dpr) / 4));
    this.bloomPass.resize();
    this.nebulaLayer.resize(w, h);
  }
  configure(scene: SceneConfig) {
    this.bloom = scene.appearance.bloom;
    this.glow = scene.appearance.glow;
    this.trail = scene.appearance.trail;
    this.streak = scene.appearance.trailStyle === "streak";
    this.nebula = scene.appearance.nebula.enabled;
    this.nebulaLayer.intensity = scene.appearance.nebula.intensity;
    this.nebulaLayer.invalidate();
    this.twinkle = scene.appearance.starfield.twinkle;
    this.parallax = scene.appearance.starfield.parallax;
    this.nebulaCanvas.style.filter =
      "hue-rotate(" + scene.appearance.nebula.hueShift + "deg)";
    this.backgroundLayer.configure(scene);
  }
  render(b: ParticleBuffer, time: number, camera: Camera) {
    const c = this.ctx,
      w = this.width,
      h = this.height,
      scale = camera.scale;
    this.nebulaLayer.interval =
      this.quality === "high" ? 4 : this.quality === "medium" ? 8 : Infinity;
    this.background.style.opacity = String(
      1 - this.twinkle * (0.04 + 0.04 * Math.sin(time)),
    );
    this.background.style.transform = `translate(${(camera.centerX - w / 2) * this.parallax * 0.03}px, ${(camera.centerY - h / 2) * this.parallax * 0.03}px) scale(${1 + this.parallax * 0.05})`;
    c.globalCompositeOperation = "destination-out";
    c.fillStyle = "#000";
    c.globalAlpha = 1 - this.trail;
    c.fillRect(0, 0, w, h);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "lighter";
    if (!this.nebula) this.nebulaContext.clearRect(0, 0, w, h);
    if (this.nebula) this.nebulaLayer.render(this.nebulaContext, w, h, time);
    const bx = b.x,
      by = b.y,
      sizes = b.size,
      hues = b.hue;
    this.particles.lowQuality = this.quality === "low";
    this.particles.render(
      b,
      scale * this.dpr,
      camera.centerX * this.dpr,
      camera.centerY * this.dpr,
      this.dpr,
    );
    c.drawImage(this.particles.canvas, 0, 0, w, h);
    c.globalAlpha = 0.35;
    for (let i = 0; i < b.count; i++) {
      const size = sizes[i] ?? 1;
      if (this.quality === "low" && size < 2) continue;
      if (((b.flags[i] ?? 0) & 16) === 0 || (b.visibility[i] ?? 1) <= 0.001)
        continue;
      c.globalAlpha = this.glow * 0.5 * (b.visibility[i] ?? 1);
      const sprite =
        this.cache.sprites[Math.min(23, Math.floor((hues[i] ?? 0) / 15)) * 4];
      const x = camera.centerX + (bx[i] ?? 0) * scale,
        y = camera.centerY + (by[i] ?? 0) * scale * 0.66,
        r = size * 4;
      if (sprite) c.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    }
    if (this.streak) {
      c.globalAlpha = 0.2;
      c.lineWidth = 0.7;
      for (let hue = 0; hue < 24; hue++) {
        c.strokeStyle = this.cache.colors[hue] ?? "#fff";
        c.beginPath();
        for (let i = 0; i < b.count; i++) {
          if ((b.visibility[i] ?? 1) < 0.01) continue;
          if (Math.floor((hues[i] ?? 0) / 15) !== hue) continue;
          c.moveTo(
            camera.centerX + (b.px[i] ?? 0) * scale,
            camera.centerY + (b.py[i] ?? 0) * scale * 0.66,
          );
          c.lineTo(
            camera.centerX + (bx[i] ?? 0) * scale,
            camera.centerY + (by[i] ?? 0) * scale * 0.66,
          );
        }
        c.stroke();
      }
    }
    this.bloomPass.render(this.canvas, this.bloomContext, this.bloom);
    c.globalAlpha = 0.12 + 0.015 * Math.sin((time * Math.PI) / 3);
    const core = this.cache.sprites[8];
    if (core)
      c.drawImage(
        core,
        camera.centerX - 90 * camera.zoom,
        camera.centerY - 65 * camera.zoom,
        180 * camera.zoom,
        130 * camera.zoom,
      );
    c.globalAlpha = 1;
  }
}
