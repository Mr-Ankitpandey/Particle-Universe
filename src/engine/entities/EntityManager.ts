import type { SceneEntity } from "../../scene/schema";
export type EntityKind = "gravityWell" | "blackHole" | "vortex";
export interface Entity {
  id: number;
  kind: EntityKind;
  x: number;
  y: number;
  strength: number;
  radius: number;
  mass: number;
  clockwise: boolean;
}
export class EntityManager {
  readonly items: Entity[] = [];
  private nextId = 1;
  constructor(private notify: (message: string) => void = () => {}) {}
  add(kind: EntityKind, x: number, y: number) {
    if (this.items.length >= 12) {
      this.notify(
        "This universe can hold 12 cosmic objects. Remove one to make room.",
      );
      return -1;
    }
    const id = this.nextId++;
    this.items.push({
      id,
      kind,
      x,
      y,
      strength: 0.08,
      radius: 0.4,
      mass: 1,
      clockwise: true,
    });
    return id;
  }
  apply(items: SceneEntity[]) {
    this.items.length = 0;
    for (const item of items) {
      const id = this.add(item.kind, item.x, item.y);
      const target = this.find(id);
      if (target) Object.assign(target, item);
    }
  }
  export(): SceneEntity[] {
    return this.items.map((item) =>
      item.kind === "blackHole"
        ? {
            kind: item.kind,
            x: Math.max(-1, Math.min(1, item.x)),
            y: Math.max(-1, Math.min(1, item.y)),
            mass: item.mass,
          }
        : item.kind === "vortex"
          ? {
              kind: item.kind,
              x: Math.max(-1, Math.min(1, item.x)),
              y: Math.max(-1, Math.min(1, item.y)),
              strength: item.strength,
              radius: item.radius,
              clockwise: item.clockwise,
            }
          : {
              kind: item.kind,
              x: Math.max(-1, Math.min(1, item.x)),
              y: Math.max(-1, Math.min(1, item.y)),
              strength: item.strength,
              radius: item.radius,
            },
    );
  }
  hit(x: number, y: number, tolerance = 0.09) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item && Math.hypot(x - item.x, y - item.y) < tolerance) return item;
    }
    return undefined;
  }
  find(id: number) {
    return this.items.find((item) => item.id === id);
  }
  remove(id: number) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
      this.notify("Cosmic object removed.");
    }
  }
  resize(id: number, factor: number) {
    const item = this.find(id);
    if (!item) return;
    item.mass = Math.max(0.4, Math.min(4, item.mass * factor));
    item.radius = Math.max(0.1, Math.min(1, item.radius * factor));
    item.strength = Math.max(0.01, Math.min(0.4, item.strength * factor));
  }
}
