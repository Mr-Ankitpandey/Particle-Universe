import { Rng } from "../../core/Rng";
export class NebulaLayer {
  intensity = 0.2;
  interval = 4;
  invalidate() {
    this.frame = 0;
  }
  private ctx: OffscreenCanvasRenderingContext2D;
  readonly canvas = new OffscreenCanvas(1, 1);
  private frame = 0;
  private blobs = new Float32Array(24);
  constructor() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw Error("Canvas unavailable");
    this.ctx = ctx;
    const rng = new Rng(817);
    for (let i = 0; i < 24; i++) this.blobs[i] = rng.next();
  }
  resize(w: number, h: number) {
    this.canvas.width = Math.max(1, Math.floor(w / 8));
    this.canvas.height = Math.max(1, Math.floor(h / 8));
    this.frame = 0;
  }
  render(target: CanvasRenderingContext2D, w: number, h: number, time: number) {
    if (this.frame++ % this.interval !== 0) return;
    {
      const c = this.ctx,
        width = this.canvas.width,
        height = this.canvas.height;
      c.clearRect(0, 0, width, height);

      for (let i = 0; i < 8; i++) {
        const x =
            (0.2 + (this.blobs[i * 3] ?? 0) * 0.6) * width +
            Math.sin(time * 0.03 + i) * 3,
          y = (0.2 + (this.blobs[i * 3 + 1] ?? 0) * 0.6) * height,
          r = (0.12 + (this.blobs[i * 3 + 2] ?? 0) * 0.22) * width;
        const gradient = c.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(
          0,
          i % 2 ? "rgba(114,58,170,.045)" : "rgba(35,70,160,.06)",
        );
        gradient.addColorStop(1, "transparent");
        c.fillStyle = gradient;
        c.fillRect(0, 0, width, height);
      }
    }
    target.clearRect(0, 0, w, h);
    target.globalCompositeOperation = "lighter";
    target.globalAlpha = Math.min(1, this.intensity * 4);
    target.drawImage(this.canvas, 0, 0, w, h);
    target.globalAlpha = 1;
  }
}
