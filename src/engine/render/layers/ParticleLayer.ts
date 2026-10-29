import type { ParticleBuffer } from "../../core/ParticleBuffer";

// Rasterize faint stars in one reusable buffer rather than submitting 20k Canvas commands.
// Bilinear splats preserve subpixel motion and additive light at full physical resolution.
export class ParticleLayer {
  readonly canvas = new OffscreenCanvas(1, 1);
  private context: OffscreenCanvasRenderingContext2D;
  private pixels = new ImageData(1, 1);
  private previousTop = 0;
  private previousBottom = 0;
  private colors = new Uint8Array(24 * 3);
  constructor() {
    const context = this.canvas.getContext("2d");
    if (!context) throw Error("Canvas 2D unavailable");
    this.context = context;
    for (let i = 0; i < 24; i++) {
      const h = i / 4,
        c = 0.33,
        x = c * (1 - Math.abs((h % 2) - 1)),
        m = 0.615;
      const r = h < 1 ? c : h < 2 ? x : h < 4 ? 0 : h < 5 ? x : c;
      const g = h < 1 ? x : h < 3 ? c : h < 4 ? x : 0;
      const b = h < 2 ? 0 : h < 3 ? x : h < 5 ? c : x;
      this.colors[i * 3] = (r + m) * 255;
      this.colors[i * 3 + 1] = (g + m) * 255;
      this.colors[i * 3 + 2] = (b + m) * 255;
    }
  }
  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.pixels = new ImageData(w, h);
    this.previousTop = 0;
    this.previousBottom = h - 1;
  }
  render(
    b: ParticleBuffer,
    scale: number,
    centerX: number,
    centerY: number,
    dpr: number,
  ) {
    const data = this.pixels.data,
      w = this.canvas.width,
      h = this.canvas.height,
      colors = this.colors;
    const x = b.x,
      y = b.y,
      sizes = b.size,
      hues = b.hue;
    const oldTop = this.previousTop,
      oldBottom = this.previousBottom;
    data.fill(0, oldTop * w * 4, (oldBottom + 1) * w * 4);
    let top = h - 1,
      bottom = 0;
    for (let i = 0; i < b.count; i++) {
      const size = sizes[i] ?? 1;
      if (size >= 1.5) continue;
      const sx = centerX + (x[i] ?? 0) * scale,
        sy = centerY + (y[i] ?? 0) * scale * 0.66;
      const ix = Math.floor(sx),
        iy = Math.floor(sy);
      if (ix < 0 || iy < 0 || ix >= w - 1 || iy >= h - 1) continue;
      if (iy < top) top = iy;
      if (iy + 1 > bottom) bottom = iy + 1;
      const fx = sx - ix,
        fy = sy - iy,
        index = (iy * w + ix) * 4;
      const color =
        Math.min(
          23,
          Math.floor(((b.flags[i] ?? 0) & 1 ? 210 : (hues[i] ?? 0)) / 15),
        ) * 3;
      const brightness = 0.36 * size * size * dpr * dpr;
      const r = (colors[color] ?? 0) * brightness,
        g = (colors[color + 1] ?? 0) * brightness,
        blue = (colors[color + 2] ?? 0) * brightness;
      this.add(data, index, r, g, blue, (1 - fx) * (1 - fy));
      this.add(data, index + 4, r, g, blue, fx * (1 - fy));
      this.add(data, index + w * 4, r, g, blue, (1 - fx) * fy);
      this.add(data, index + (w + 1) * 4, r, g, blue, fx * fy);
    }
    const dirtyTop = Math.min(top, oldTop),
      dirtyBottom = Math.max(bottom, oldBottom);
    this.context.putImageData(
      this.pixels,
      0,
      0,
      0,
      dirtyTop,
      w,
      dirtyBottom - dirtyTop + 1,
    );
    this.previousTop = top;
    this.previousBottom = bottom;
  }
  private add(
    data: Uint8ClampedArray,
    index: number,
    r: number,
    g: number,
    b: number,
    weight: number,
  ) {
    data[index] = (data[index] ?? 0) + r * weight;
    data[index + 1] = (data[index + 1] ?? 0) + g * weight;
    data[index + 2] = (data[index + 2] ?? 0) + b * weight;
    data[index + 3] = 255;
  }
}
