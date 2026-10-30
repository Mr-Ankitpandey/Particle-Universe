import { Rng } from "../core/Rng";
import { ParticleBuffer } from "../core/ParticleBuffer";
import { defaultScene } from "../../scene/defaults";
import type { SceneConfig } from "../../scene/schema";
function hsl(hex: string) {
  const value = parseInt(hex.slice(1), 16),
    r = (value >> 16) / 255,
    g = ((value >> 8) & 255) / 255,
    b = (value & 255) / 255,
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min,
    lum = (max + min) / 2;
  let hue = 0;
  if (delta)
    hue =
      60 *
      (max === r
        ? ((g - b) / delta + 6) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4);
  return {
    hue,
    sat: delta === 0 ? 0 : delta / (1 - Math.abs(2 * lum - 1)),
    lum,
  };
}
export function galaxy(
  buffer: ParticleBuffer,
  seed: number,
  scene: SceneConfig = defaultScene,
) {
  const rng = new Rng(seed),
    cfg = scene.galaxy,
    R = cfg.radius / 0.48,
    colors = Object.values(scene.appearance.palette).map(hsl);
  for (let i = 0; i < buffer.count; i++) {
    const core = rng.next() < cfg.coreSize;
    let radius = core
      ? Math.abs(rng.gaussian()) * 0.085
      : Math.min(1.05, -Math.log(Math.max(0.001, 1 - rng.next())) * 0.32);
    let angle = core
      ? rng.next() * Math.PI * 2
      : ((i % cfg.arms) * Math.PI * 2) / cfg.arms +
        radius * cfg.armTwist +
        rng.gaussian() * cfg.armSpread;
    if (cfg.type === "ring") {
      radius = 0.62 + rng.gaussian() * 0.055;
      angle = rng.next() * Math.PI * 2;
    }
    const scatter = 0.012 + radius * 0.045;
    let x = Math.cos(angle) * radius + rng.gaussian() * scatter,
      y = Math.sin(angle) * radius + rng.gaussian() * scatter;
    if (cfg.type === "elliptical") {
      x = rng.gaussian() * 0.3;
      y = rng.gaussian() * 0.2;
    }
    if (cfg.type === "barred" && radius < 0.25) {
      x *= 2.4;
      y *= 0.35;
    }
    if (cfg.type === "none") {
      x = (rng.next() - 0.5) * 2.4;
      y = (rng.next() - 0.5) * 2;
    }
    x *= R;
    y *= R;
    buffer.hx[i] = x;
    buffer.hy[i] = y;
    buffer.x[i] = x * 2.7 + rng.gaussian() * 0.25;
    buffer.y[i] = y * 2.7 + rng.gaussian() * 0.25;
    const t = scene.appearance.colorMode === "palette" ? i % 4 : core ? 0 : Math.min(2.999, radius * 3.5),
      index = Math.floor(t),
      a = colors[index] ?? colors[0],
      b = colors[Math.min(3, index + 1)] ?? a,
      f = t - index;
    if (a && b) {
      const delta = ((b.hue - a.hue + 540) % 360) - 180;
      buffer.hue[i] = (a.hue + delta * f + 360 + rng.next() * 8) % 360;
      buffer.sat[i] = a.sat + (b.sat - a.sat) * f;
      buffer.lum[i] = a.lum + (b.lum - a.lum) * f;
    }
    buffer.size[i] =
      scene.appearance.particleSize *
        (1 + (rng.next() - 0.5) * scene.appearance.sizeVariance * 2) +
      (i % 97 === 0 ? 1.6 : 0);
    buffer.flags[i] = i % 97 === 0 ? 16 : 0;
    buffer.life[i] = Infinity;
    buffer.vx[i] = 0;
    buffer.vy[i] = 0;
    buffer.visibility[i] = 1;
  }
}
