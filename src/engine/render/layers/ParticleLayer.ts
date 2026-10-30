import type { ParticleBuffer } from "../../core/ParticleBuffer";

// Rasterize faint stars in one reusable buffer rather than submitting 20k Canvas commands.
// Bilinear splats preserve subpixel motion and additive light at full physical resolution.
export class ParticleLayer {
  lowQuality = false;
  readonly canvas = new OffscreenCanvas(1, 1);
  private context: OffscreenCanvasRenderingContext2D;
  private pixels = new ImageData(1, 1);
  private previousTop = 0;
  private previousBottom = 0;
  private colors = new Uint8Array(24 * 8 * 16 * 3);
  constructor() {
    const context = this.canvas.getContext("2d");
    if (!context) throw Error("Canvas 2D unavailable");
    this.context = context;
    for (let hue = 0; hue < 24; hue++)
      for (let saturation = 0; saturation < 8; saturation++)
        for (let light = 0; light < 16; light++) {
          const h = hue / 4,
            l = light / 15,
            c = ((1 - Math.abs(2 * l - 1)) * saturation) / 7,
            x = c * (1 - Math.abs((h % 2) - 1)),
            m = l - c / 2;
          const r = h < 1 ? c : h < 2 ? x : h < 4 ? 0 : h < 5 ? x : c,
            g = h < 1 ? x : h < 3 ? c : h < 4 ? x : 0,
            b = h < 2 ? 0 : h < 3 ? x : h < 5 ? c : x;
          const index = ((hue * 8 + saturation) * 16 + light) * 3;
          this.colors[index] = (r + m) * 255;
          this.colors[index + 1] = (g + m) * 255;
          this.colors[index + 2] = (b + m) * 255;
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
      if (
        (((b.flags[i] ?? 0) & 16) !== 0 && !(this.lowQuality && size < 2)) ||
        (b.visibility[i] ?? 1) <= 0.001
      )
        continue;
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
      const hue = Math.min(
        23,
        Math.floor(((b.flags[i] ?? 0) & 1 ? 210 : (hues[i] ?? 0)) / 15),
      );
      const color =
        ((hue * 8 + Math.min(7, Math.round((b.sat[i] ?? 0.75) * 7))) * 16 +
          Math.min(15, Math.round((b.lum[i] ?? 0.78) * 15))) *
        3;
      const brightness =
        0.36 * size * size * dpr * dpr * (b.visibility[i] ?? 1);
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
