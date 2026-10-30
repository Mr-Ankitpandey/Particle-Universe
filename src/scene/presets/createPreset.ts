import { defaultScene } from "../defaults";
import { sceneSchema, type SceneConfig } from "../schema";
export function createPreset(edit: (scene: SceneConfig) => void) {
  const scene = structuredClone(defaultScene);
  edit(scene);
  return sceneSchema.parse(scene);
}
