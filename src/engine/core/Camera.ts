export class Camera {
  width = 1;
  height = 1;
  zoom = 1;
  panX = 0;
  panY = 0;
  get scale() {
    return Math.min(this.width, this.height) * 0.48 * this.zoom;
  }
  get centerX() {
    return this.width * 0.5 + this.panX;
  }
  get centerY() {
    return this.height * 0.52 + this.panY;
  }
  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
  screenToWorld(x: number, y: number, out: { x: number; y: number }) {
    out.x = (x - this.centerX) / this.scale;
    out.y = (y - this.centerY) / (this.scale * 0.66);
  }
  zoomAt(factor: number, x: number, y: number) {
    const previous = this.zoom;
    this.zoom = Math.max(0.25, Math.min(4, this.zoom * factor));
    const ratio = this.zoom / previous;
    this.panX = x - this.width * 0.5 - (x - this.centerX) * ratio;
    this.panY = y - this.height * 0.52 - (y - this.centerY) * ratio;
  }
  reset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
}
