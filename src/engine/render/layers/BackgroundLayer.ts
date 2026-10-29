import { starfield } from "../../generators/starfield";
export class BackgroundLayer {
  constructor(private context: CanvasRenderingContext2D) {}
  render(width: number, height: number) {
    const ctx = this.context,
      gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#03030a");
    gradient.addColorStop(1, "#0b0820");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    starfield(ctx, width, height);
  }
}
