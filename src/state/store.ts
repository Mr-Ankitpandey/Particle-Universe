import { createStore } from "zustand/vanilla";
import { defaultScene } from "../scene/defaults";
import { sceneSchema, type SceneConfig } from "../scene/schema";
import { History } from "./history";
export type Quality = "auto" | "high" | "medium" | "low";
interface State {
  config: SceneConfig;
  preset: SceneConfig;
  quality: Quality;
  undoCount: number;
  redoCount: number;
  setConfig: (scene: SceneConfig, group?: boolean) => void;
  loadPreset: (scene: SceneConfig) => void;
  undo: () => void;
  redo: () => void;
  setQuality: (quality: Quality) => void;
}
const history = new History();
let lastGrouped = 0;
export const sceneStore = createStore<State>((set, get) => ({
  config: structuredClone(defaultScene),
  preset: structuredClone(defaultScene),
  quality: "auto",
  undoCount: 0,
  redoCount: 0,
  setConfig: (value, group = false) => {
    const config = sceneSchema.parse(value),
      now = Date.now();
    if (JSON.stringify(config) === JSON.stringify(get().config)) return;
    if (!group || now - lastGrouped > 350) history.push(get().config);
    lastGrouped = group ? now : 0;
    set({ config, undoCount: history.undoCount, redoCount: history.redoCount });
  },
  loadPreset: (scene) => {
    get().setConfig(structuredClone(scene));
    set({ preset: structuredClone(scene) });
  },
  undo: () => {
    lastGrouped = 0;
    set({
      config: history.undo(get().config),
      undoCount: history.undoCount,
      redoCount: history.redoCount,
    });
  },
  redo: () => {
    lastGrouped = 0;
    set({
      config: history.redo(get().config),
      undoCount: history.undoCount,
      redoCount: history.redoCount,
    });
  },
  setQuality: (quality) => set({ quality }),
}));
export function updateScene(edit: (scene: SceneConfig) => void, group = false) {
  const scene = structuredClone(sceneStore.getState().config);
  edit(scene);
  sceneStore.getState().setConfig(scene, group);
}
