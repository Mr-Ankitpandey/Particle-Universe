import type { Camera } from "../../core/Camera";
import type { Shockwave } from "../../forces/Shockwave";
import type { PointerSource } from "../../../input/tools";
const COLORS = ["#ff6bcf", "#9ea5ff", "#6be8ff"];
export class EffectsLayer {
  constructor(private ctx: CanvasRenderingContext2D) {}
  render(
    camera: Camera,
    waves: Shockwave,
    sources: PointerSource[],
    now: number,
  ) {
    const c = this.ctx;
    c.clearRect(0, 0, camera.width, camera.height);
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < waves.age.length; i++) {
      const age = waves.age[i] ?? -1;
      if (age < 0) continue;
      const x = camera.centerX + (waves.x[i] ?? 0) * camera.scale,
        y = camera.centerY + (waves.y[i] ?? 0) * camera.scale * 0.66;
      const radius = age * 2 * camera.scale;
      c.globalAlpha = (1 - age / 1.2) * 0.5;
      c.lineWidth = 1.2;
      for (let ring = 0; ring < 3; ring++) {
        c.strokeStyle = COLORS[ring] ?? "#fff";
        c.beginPath();
        c.ellipse(
          x,
          y,
          Math.max(0.1, radius + ring * 2),
          Math.max(0.1, (radius + ring * 2) * 0.66),
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
    }
    for (const source of sources) {
      if (!source.active || source.tool === "pan") continue;
      const x = camera.centerX + source.x * camera.scale,
        y = camera.centerY + source.y * camera.scale * 0.66,
        charge =
          source.tool === "supernova"
            ? Math.min(1.5, (now - source.started) / 1000)
            : 0;
      c.globalAlpha = 0.4;
      c.strokeStyle = charge ? "#ffd9a6" : "#c6b2ff";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(
        x,
        y,
        charge ? 12 + charge * 30 : source.radius * camera.scale,
        0,
        Math.PI * 2,
      );
      c.stroke();
      if (charge) {
        c.globalAlpha = charge * 0.12;
        c.fillStyle = "#ffd9a6";
        c.fill();
      }
    }
    c.globalAlpha = 1;
  }
}
