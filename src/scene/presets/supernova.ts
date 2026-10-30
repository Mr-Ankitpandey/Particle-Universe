import { createPreset } from "./createPreset";
export const supernovaPreset = createPreset((s) => {
  s.name = "Supernova";
  s.seed = 411;
  s.galaxy.type = "elliptical";
  s.galaxy.coreSize = 0.55;
  s.galaxy.radius = 0.28;
  s.appearance.palette = {
    core: "#FFFFED",
    inner: "#FFD784",
    outer: "#F56F39",
    accent: "#A64FAF",
  };
  s.appearance.bloom = 0.5;
  s.behaviors.onClick = "supernova";
  s.behaviors.onIdle = "pulse";
});
