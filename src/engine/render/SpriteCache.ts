export class SpriteCache {
  readonly sprites: OffscreenCanvas[] = [];
  readonly colors: string[] = [];
  constructor() {
    for (let h = 0; h < 24; h++) {
      this.colors.push("hsl(" + h * 15 + " 75% 78%)");
      for (let size = 0; size < 4; size++) {
        const canvas = new OffscreenCanvas(32, 32),
          ctx = canvas.getContext("2d");
        if (!ctx) throw Error("Canvas 2D unavailable");
        const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, "hsla(" + h * 15 + ",70%,92%,.9)");
        g.addColorStop(0.13, "hsla(" + h * 15 + ",75%,75%,.5)");
        g.addColorStop(0.4, "hsla(" + h * 15 + ",80%,60%,.09)");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 32, 32);
        this.sprites.push(canvas);
      }
    }
  }
}
