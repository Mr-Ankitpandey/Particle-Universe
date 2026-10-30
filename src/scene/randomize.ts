import { Rng } from "../engine/core/Rng";
import { defaultScene } from "./defaults";
import { universeName } from "./names";
import { sceneSchema, type SceneConfig } from "./schema";
export const palettes = [
  ["#FFF4E0", "#8FB8FF", "#9B5CFF", "#FF4FD8"],
  ["#FFF9EC", "#FFC187", "#E47499", "#846FD7"],
  ["#EFFFFF", "#8CE4DC", "#568FCB", "#A18BE0"],
  ["#FFF2F7", "#FFB4CF", "#C076C4", "#677BCB"],
  ["#FFF4C7", "#E8B86D", "#B16B5B", "#665690"],
  ["#F1F0FF", "#BCB9FF", "#8C6BE8", "#DD8BC3"],
  ["#E6FFFF", "#9AE5E5", "#468EAD", "#4C517E"],
  ["#FFF3EF", "#F7B3A6", "#D66B89", "#8B63AB"],
  ["#FFFFE8", "#D5D89A", "#78ADAC", "#5D76AA"],
  ["#F6EEFF", "#DBA5E1", "#9C6DB0", "#7394D4"],
  ["#FFF8ED", "#EBC88C", "#C08C69", "#7D718C"],
  ["#EDFFFF", "#B4DCF2", "#7B9FDA", "#B89CEB"],
  ["#FFFFF1", "#CDE7BD", "#79C8BB", "#648BAE"],
  ["#FFF0F8", "#EEADD0", "#B371B5", "#717CCE"],
  ["#F4F6FF", "#B6CAFF", "#8491DB", "#B36CC7"],
  ["#FFFAEA", "#F1D2A3", "#CBA6AD", "#937AA7"],
  ["#EFFFFB", "#A3DCCE", "#6EAAA9", "#777CAA"],
  ["#FFF2E9", "#E5AB8E", "#BC7893", "#8B74B7"],
  ["#F8F0FF", "#CFB2EE", "#9E8FD0", "#93BFD9"],
  ["#FFFDEB", "#ECD9A5", "#B6C4B6", "#7D9FC1"],
];
export function randomize(
  seed: number,
  current?: SceneConfig,
  colorsOnly = false,
) {
  const rng = new Rng(seed),
    scene = structuredClone(current ?? defaultScene),
    colors = palettes[Math.floor(rng.next() * palettes.length)] ?? palettes[0];
  if (colors) {
    scene.appearance.palette = {
      core: colors[0] ?? "#fff4e0",
      inner: colors[1] ?? "#8fb8ff",
      outer: colors[2] ?? "#9b5cff",
      accent: colors[3] ?? "#ff4fd8",
    };
  }
  if (!colorsOnly) {
    scene.seed = seed;
    scene.name = universeName(rng);
    scene.galaxy.type =
      (["spiral", "elliptical", "ring", "barred"] as const)[
        Math.floor(rng.next() * 4)
      ] ?? "spiral";
    scene.galaxy.arms = 2 + Math.floor(rng.next() * 4);
    scene.galaxy.armTwist = 4 + rng.next() * 5;
    scene.galaxy.armSpread = 0.2 + rng.next() * 0.3;
    scene.galaxy.radius = 0.36 + rng.next() * 0.18;
    scene.galaxy.coreSize = 0.08 + rng.next() * 0.18;
    scene.physics.turbulence = rng.next() * 0.025;
    scene.physics.flowField.enabled = false;
    scene.behaviors = { onClick: "shockwave", onIdle: "drift" };
    scene.entities = [];
    for (let i = 0, count = Math.floor(rng.next() * 4); i < count; i++)
      scene.entities.push({
        kind: "vortex",
        x: (rng.next() - 0.5) * 1.2,
        y: (rng.next() - 0.5) * 1.2,
        strength: 0.02 + rng.next() * 0.025,
        radius: 0.2 + rng.next() * 0.2,
        clockwise: rng.next() > 0.5,
      });
  }
  return sceneSchema.parse(scene);
}
