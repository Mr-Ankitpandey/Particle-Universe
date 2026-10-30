import { Rng } from "../core/Rng";
export function starfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density = 1,
) {
  const rng = new Rng(714);
  for (let i = 0; i < 650 * density; i++) {
    ctx.fillStyle = "rgba(190,200,255," + (0.12 + rng.next() * 0.5) + ")";
    ctx.fillRect(
      rng.next() * width,
      rng.next() * height,
      rng.next() * 1.3 + 0.3,
      0.8,
    );
  }
}
