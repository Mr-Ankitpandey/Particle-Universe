import { ParticleBuffer } from "../core/ParticleBuffer";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { SpriteCache } from "./SpriteCache";
import { ParticleLayer } from "./layers/ParticleLayer";
export class Renderer {
  private particles = new ParticleLayer();
  private cache = new SpriteCache();
  private ctx: CanvasRenderingContext2D;
  private bg: CanvasRenderingContext2D;
  private backgroundLayer: BackgroundLayer;
  width = 1;
  height = 1;
  dpr = 1;
  constructor(
    private canvas: HTMLCanvasElement,
    private background: HTMLCanvasElement,
  ) {
    const ctx = canvas.getContext("2d"),
      bg = background.getContext("2d");
    if (!ctx || !bg) throw Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.bg = bg;
    this.backgroundLayer = new BackgroundLayer(bg);
  }
  resize(w: number, h: number, dpr: number) {
    this.width = w;
    this.height = h;
    this.dpr = Math.min(2, dpr);
    for (const c of [this.canvas, this.background]) {
      c.width = w * this.dpr;
      c.height = h * this.dpr;
    }
    this.particles.resize(this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.bg.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.backgroundLayer.render(w, h);
  }
  render(b: ParticleBuffer, time: number) {
    const c = this.ctx,
      w = this.width,
      h = this.height,
      scale = Math.min(w, h) * 0.48;
    c.globalCompositeOperation = "destination-out";
    c.fillStyle = "rgba(0,0,0,.26)";
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "lighter";
    const bx = b.x,
      by = b.y,
      sizes = b.size,
      hues = b.hue;
    this.particles.render(
      b,
      scale * this.dpr,
      w * 0.5 * this.dpr,
      h * 0.52 * this.dpr,
      this.dpr,
    );
    c.drawImage(this.particles.canvas, 0, 0, w, h);
    c.globalAlpha = 0.35;
    for (let i = 0; i < b.count; i++) {
      const size = sizes[i] ?? 1;
      if (size < 1.5) continue;
      const sprite =
        this.cache.sprites[Math.min(23, Math.floor((hues[i] ?? 0) / 15)) * 4];
      const x = w * 0.5 + (bx[i] ?? 0) * scale,
        y = h * 0.52 + (by[i] ?? 0) * scale * 0.66,
        r = size * 4;
      if (sprite) c.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    }
    c.globalAlpha = 0.12 + 0.015 * Math.sin((time * Math.PI) / 3);
    const core = this.cache.sprites[8];
    if (core) c.drawImage(core, w * 0.5 - 90, h * 0.52 - 65, 180, 130);
    c.globalAlpha = 1;
  }
}
