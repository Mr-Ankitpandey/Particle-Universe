import type {
  EntityManager,
  EntityKind,
} from "../engine/entities/EntityManager";
import { Camera } from "../engine/core/Camera";
import type { PointerSource, ToolId } from "./tools";
export interface InteractionActions {
  shouldThaw(x: number, y: number, radius: number): boolean;
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
    private entities: EntityManager,
  ) {
    for (let i = 0; i < 10; i++)
      this.sources.push({
        id: -1,
        entityId: -1,
        unfreeze: false,
        longPress: 0,
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
  private scratch = { x: 0, y: 0 };
  private context = (event: MouseEvent) => {
    event.preventDefault();
    this.camera.screenToWorld(event.clientX, event.clientY, this.scratch);
    const hit = this.entities.hit(this.scratch.x, this.scratch.y);
    if (hit) this.entities.remove(hit.id);
  };
  private down = (event: PointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    const source = this.sources.find((p) => !p.active);
    if (!source) return;
    this.canvas.setPointerCapture(event.pointerId);
    source.id = event.pointerId;
    source.entityId = -1;
    source.unfreeze = event.shiftKey;
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
    if (source.tool === "freeze")
      source.unfreeze =
        event.shiftKey ||
        this.actions.shouldThaw(source.x, source.y, source.radius);
    const hit = this.entities.hit(
      source.x,
      source.y,
      Math.max(0.09, 22 / this.camera.scale),
    );
    if (hit) {
      source.entityId = hit.id;
      source.tool = "pan";
      source.longPress = window.setTimeout(() => {
        this.entities.remove(hit.id);
        source.active = false;
      }, 650);
    } else if (
      source.tool === "gravityWell" ||
      source.tool === "blackHole" ||
      source.tool === "vortex"
    ) {
      source.entityId = this.entities.add(
        source.tool as EntityKind,
        source.x,
        source.y,
      );
      source.tool = "pan";
    }
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
    if (Math.abs(dx) + Math.abs(dy) > 2) clearTimeout(source.longPress);
    if (source.entityId >= 0) {
      this.camera.screenToWorld(event.clientX, event.clientY, source);
      const entity = this.entities.find(source.entityId);
      if (entity) {
        entity.x = source.x;
        entity.y = source.y;
      }
      this.updatePinch(true);
      return;
    }
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
      if (first.entityId >= 0 && first.entityId === second.entityId) {
        this.entities.resize(first.entityId, distance / this.pinchDistance);
      } else this.camera.zoomAt(distance / this.pinchDistance, cx, cy);
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
    clearTimeout(source.longPress);
    source.active = false;
    this.updatePinch(false);
  };
  private cancel = (event: PointerEvent) => {
    const source = this.sources.find((p) => p.id === event.pointerId);
    if (source) {
      clearTimeout(source.longPress);
      source.active = false;
    }
    this.updatePinch(false);
  };
  private wheel = (event: WheelEvent) => {
    event.preventDefault();
    this.camera.screenToWorld(event.clientX, event.clientY, this.scratch);
    const hit = this.entities.hit(this.scratch.x, this.scratch.y);
    if (hit) {
      this.entities.resize(hit.id, Math.exp(-event.deltaY * 0.001));
      return;
    }
    this.camera.zoomAt(
      Math.exp(-event.deltaY * 0.001),
      event.clientX,
      event.clientY,
    );
  };
  dispose() {
    for (const source of this.sources) clearTimeout(source.longPress);
    this.canvas.removeEventListener("pointerdown", this.down);
    this.canvas.removeEventListener("pointermove", this.move);
    this.canvas.removeEventListener("pointerup", this.up);
    this.canvas.removeEventListener("pointercancel", this.cancel);
    this.canvas.removeEventListener("wheel", this.wheel);
    this.canvas.removeEventListener("contextmenu", this.context);
  }
}
