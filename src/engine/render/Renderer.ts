import { ParticleBuffer } from "../core/ParticleBuffer";
import { Rng } from "../core/Rng";
import { SpriteCache } from "./SpriteCache";
export class Renderer {
  private cache = new SpriteCache();
  private ctx: CanvasRenderingContext2D;
  private bg: CanvasRenderingContext2D;
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
  }
  resize(w: number, h: number, dpr: number) {
    this.width = w;
    this.height = h;
    this.dpr = Math.min(2, dpr);
    for (const c of [this.canvas, this.background]) {
      c.width = w * this.dpr;
      c.height = h * this.dpr;
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.bg.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const c = this.bg,
      g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#03030a");
    g.addColorStop(1, "#0b0820");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const rng = new Rng(714);
    for (let i = 0; i < 650; i++) {
      c.fillStyle = "rgba(190,200,255," + (0.12 + rng.next() * 0.5) + ")";
      c.fillRect(rng.next() * w, rng.next() * h, rng.next() * 1.3 + 0.3, 0.8);
    }
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
    // Bucket state changes; subpixel stars avoid expensive sprite sampling.
    for (let bucket = 0; bucket < 24; bucket++) {
      c.fillStyle = this.cache.colors[bucket] ?? "#fff";
      c.globalAlpha = 0.2;
      const sprite = this.cache.sprites[bucket * 4];
      for (let i = 0; i < b.count; i++) {
        if (Math.min(23, Math.floor((hues[i] ?? 0) / 15)) !== bucket) continue;
        const x = w * 0.5 + (bx[i] ?? 0) * scale,
          y = h * 0.52 + (by[i] ?? 0) * scale * 0.66,
          size = sizes[i] ?? 1;
        if (size < 1.5) c.fillRect(x, y, size, size);
        else if (sprite) {
          const r = size * 4;
          c.drawImage(sprite, x - r, y - r, r * 2, r * 2);
        }
      }
    }
    c.globalAlpha = 0.12 + 0.015 * Math.sin((time * Math.PI) / 3);
    const core = this.cache.sprites[8];
    if (core) c.drawImage(core, w * 0.5 - 90, h * 0.52 - 65, 180, 130);
    c.globalAlpha = 1;
  }
}
