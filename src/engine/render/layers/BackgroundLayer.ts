import type { SceneConfig } from "../../../scene/schema";
import { starfield } from "../../generators/starfield";
export class BackgroundLayer {
  private top = "#03030a";
  private bottom = "#0b0820";
  private density = 1;
  private width = 1;
  private height = 1;
  configure(scene: SceneConfig) {
    if (this.top === scene.appearance.background.top && this.bottom === scene.appearance.background.bottom && this.density === scene.appearance.starfield.density) return;
    this.top = scene.appearance.background.top;
    this.bottom = scene.appearance.background.bottom;
    this.density = scene.appearance.starfield.density;
    this.render(this.width, this.height);
  }

  constructor(private context: CanvasRenderingContext2D) {}
  render(width: number, height: number) {
    this.width = width;
    this.height = height;
    const ctx = this.context,
      gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.top);
    gradient.addColorStop(1, this.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    starfield(ctx, width, height, this.density);
  }
}
