import { sceneSchema, type SceneConfig } from "./schema";
import { defaultScene } from "./defaults";
export function migrate(value: unknown): SceneConfig {
  if (
    value &&
    typeof value === "object" &&
    "version" in value &&
    value.version === 0
  ) {
    const old = value as Record<string, unknown>;
    return sceneSchema.parse({
      ...structuredClone(defaultScene),
      ...old,
      version: 1,
    });
  }
  return sceneSchema.parse(value);
}
