import { createPreset } from "./createPreset";
export const blackHole = createPreset((s) => {
  s.name = "Black Hole";
  s.seed = 991;
  s.galaxy.type = "ring";
  s.galaxy.coreSize = 0;
  s.entities = [{ kind: "blackHole", x: 0, y: 0, mass: 1.6 }];
  s.appearance.palette = {
    core: "#FFF0C9",
    inner: "#FFBB73",
    outer: "#C26B40",
    accent: "#8B8DFF",
  };
  s.appearance.trailStyle = "streak";
  s.appearance.bloom = 0.4;
  s.appearance.nebula.intensity = 0.08;
});
