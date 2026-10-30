import type { SceneConfig } from "../scene/schema";
export class History {
  private past: SceneConfig[] = [];
  private future: SceneConfig[] = [];
  get undoCount() {
    return this.past.length;
  }
  get redoCount() {
    return this.future.length;
  }
  push(scene: SceneConfig) {
    this.past.push(structuredClone(scene));
    if (this.past.length > 50) this.past.shift();
    this.future = [];
  }
  undo(current: SceneConfig) {
    const scene = this.past.pop();
    if (!scene) return current;
    this.future.push(structuredClone(current));
    return scene;
  }
  redo(current: SceneConfig) {
    const scene = this.future.pop();
    if (!scene) return current;
    this.past.push(structuredClone(current));
    return scene;
  }
}
