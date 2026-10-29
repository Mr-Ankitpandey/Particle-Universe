import { Camera } from "../engine/core/Camera";
import type { PointerSource, ToolId } from "./tools";
export interface InteractionActions {
  shockwave(x: number, y: number): void;
  supernova(x: number, y: number, charge: number): void;
}
export class InputController {
  tool: ToolId = "attract";
  radius = 0.45;
  readonly sources: PointerSource[] = [];
  private pinchDistance = 0;
  private pinchX = 0;
  private pinchY = 0;
  constructor(
    private canvas: HTMLCanvasElement,
    private camera: Camera,
    private actions: InteractionActions,
  ) {
    for (let i = 0; i < 10; i++)
      this.sources.push({
        id: -1,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        screenX: 0,
        screenY: 0,
        time: 0,
        started: 0,
        tool: "attract",
        radius: 0.45,
      });
    canvas.addEventListener("pointerdown", this.down);
    canvas.addEventListener("pointermove", this.move);
    canvas.addEventListener("pointerup", this.up);
    canvas.addEventListener("pointercancel", this.cancel);
    canvas.addEventListener("wheel", this.wheel, { passive: false });
    canvas.addEventListener("contextmenu", this.context);
  }
  private context = (event: Event) => event.preventDefault();
  private down = (event: PointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    const source = this.sources.find((p) => !p.active);
    if (!source) return;
    this.canvas.setPointerCapture(event.pointerId);
    source.id = event.pointerId;
    source.active = true;
    source.tool = event.button === 1 ? "pan" : this.tool;
    source.radius = this.radius;
    source.started = performance.now();
    source.time = source.started;
    source.screenX = event.clientX;
    source.screenY = event.clientY;
    source.vx = 0;
    source.vy = 0;
    this.camera.screenToWorld(event.clientX, event.clientY, source);
    if (source.tool === "shockwave") this.actions.shockwave(source.x, source.y);
    this.updatePinch(false);
  };
  private move = (event: PointerEvent) => {
    const source = this.sources.find(
      (p) => p.active && p.id === event.pointerId,
    );
    if (!source) return;
    const dx = event.clientX - source.screenX,
      dy = event.clientY - source.screenY;
    const now = performance.now(),
      dt = Math.max(0.008, (now - source.time) / 1000),
      oldX = source.x,
      oldY = source.y;
    source.screenX = event.clientX;
    source.screenY = event.clientY;
    source.time = now;
    if (source.tool === "pan") {
      this.camera.panX += dx;
      this.camera.panY += dy;
    }
    this.camera.screenToWorld(event.clientX, event.clientY, source);
    source.vx = Math.max(-3, Math.min(3, (source.x - oldX) / dt));
    source.vy = Math.max(-3, Math.min(3, (source.y - oldY) / dt));
    this.updatePinch(true);
  };
  private updatePinch(apply: boolean) {
    let first: PointerSource | undefined, second: PointerSource | undefined;
    for (const source of this.sources) {
      if (!source.active) continue;
      if (!first) first = source;
      else {
        second = source;
        break;
      }
    }
    if (!first || !second) {
      this.pinchDistance = 0;
      return;
    }
    const distance = Math.hypot(
        first.screenX - second.screenX,
        first.screenY - second.screenY,
      ),
      cx = (first.screenX + second.screenX) / 2,
      cy = (first.screenY + second.screenY) / 2;
    if (apply && this.pinchDistance > 0) {
      this.camera.zoomAt(distance / this.pinchDistance, cx, cy);
      this.camera.panX += cx - this.pinchX;
      this.camera.panY += cy - this.pinchY;
      for (const source of this.sources)
        if (source.active)
          this.camera.screenToWorld(source.screenX, source.screenY, source);
    }
    this.pinchDistance = distance;
    this.pinchX = cx;
    this.pinchY = cy;
  }
  private up = (event: PointerEvent) => {
    const source = this.sources.find(
      (p) => p.active && p.id === event.pointerId,
    );
    if (!source) return;
    if (source.tool === "supernova")
      this.actions.supernova(
        source.x,
        source.y,
        (performance.now() - source.started) / 1000,
      );
    source.active = false;
    this.updatePinch(false);
  };
  private cancel = (event: PointerEvent) => {
    const source = this.sources.find((p) => p.id === event.pointerId);
    if (source) source.active = false;
    this.updatePinch(false);
  };
  private wheel = (event: WheelEvent) => {
    event.preventDefault();
    this.camera.zoomAt(
      Math.exp(-event.deltaY * 0.001),
      event.clientX,
      event.clientY,
    );
  };
  dispose() {
    this.canvas.removeEventListener("pointerdown", this.down);
    this.canvas.removeEventListener("pointermove", this.move);
    this.canvas.removeEventListener("pointerup", this.up);
    this.canvas.removeEventListener("pointercancel", this.cancel);
    this.canvas.removeEventListener("wheel", this.wheel);
    this.canvas.removeEventListener("contextmenu", this.context);
  }
}
