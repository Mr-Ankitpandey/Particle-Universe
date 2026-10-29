import type { EntityManager } from "../../entities/EntityManager";
import type { Camera } from "../../core/Camera";
import type { Shockwave } from "../../forces/Shockwave";
import type { PointerSource } from "../../../input/tools";
const COLORS = ["#ff6bcf", "#9ea5ff", "#6be8ff"];
export class EffectsLayer {
  private wasActive = false;
  constructor(private ctx: CanvasRenderingContext2D) {}
  render(
    camera: Camera,
    waves: Shockwave,
    sources: PointerSource[],
    now: number,
    entities: EntityManager,
  ) {
    const c = this.ctx;
    let active = entities.items.length > 0;
    for (let i = 0; i < waves.age.length; i++)
      if ((waves.age[i] ?? -1) >= 0) active = true;
    for (let i = 0; i < sources.length; i++)
      if (sources[i]?.active) active = true;
    if (!active) {
      if (this.wasActive) c.clearRect(0, 0, camera.width, camera.height);
      this.wasActive = false;
      return;
    }
    this.wasActive = true;
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
    for (let i = 0; i < entities.items.length; i++) {
      const entity = entities.items[i];
      if (!entity) continue;
      const x = camera.centerX + entity.x * camera.scale,
        y = camera.centerY + entity.y * camera.scale * 0.66;
      const radius = 0.035 * Math.sqrt(entity.mass) * camera.scale;
      c.globalAlpha = 1;
      if (entity.kind === "blackHole") {
        c.globalCompositeOperation = "lighter";
        for (let j = 0; j < 32; j++) {
          const angle = (j * Math.PI) / 16 + now * 0.00015;
          c.strokeStyle = j < 16 ? "#ffbf73" : "#c7dfff";
          c.globalAlpha = 0.08 + 0.45 * (1 + Math.cos(angle)) * 0.5;
          c.lineWidth = 2 + radius * 0.1;
          c.beginPath();
          c.ellipse(
            x,
            y,
            radius * 2.7,
            radius * 0.85,
            -0.25,
            angle,
            angle + Math.PI / 16,
          );
          c.stroke();
        }
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        c.fillStyle = "#000";
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#ffe7b1";
        c.lineWidth = 1.3;
        c.stroke();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.25;
        c.strokeStyle = "#ff9d5c";
        c.lineWidth = 4;
        c.stroke();
      } else {
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.55;
        c.strokeStyle = entity.kind === "vortex" ? "#ee9be8" : "#96cbff";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(x, y, 12 * camera.zoom, now * 0.001, now * 0.001 + Math.PI * 1.6);
        c.stroke();
        c.beginPath();
        c.arc(x, y, 3, 0, Math.PI * 2);
        c.fillStyle = c.strokeStyle;
        c.fill();
      }
      c.globalAlpha = 0.7;
      c.fillStyle = "#d4c6ef";
      c.font = "10px system-ui";
      c.fillText(
        entity.kind === "blackHole"
          ? "BLACK HOLE"
          : entity.kind === "vortex"
            ? "VORTEX"
            : "GRAVITY WELL",
        x + radius + 10,
        y + 4,
      );
    }
    c.globalAlpha = 1;
  }
}
