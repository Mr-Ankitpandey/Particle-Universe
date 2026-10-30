import { createPreset } from "./createPreset";
export const deepSpace = createPreset((s) => {
  s.name = "Deep Space";
  s.seed = 119;
  s.galaxy.type = "none";
  s.galaxy.particleCount = 6000;
  s.galaxy.radius = 0.7;
  s.galaxy.rotationSpeed = 0.08;
  s.galaxy.coreSize = 0;
  s.physics.gravity = 0.1;
  s.appearance.particleSize = 0.6;
  s.appearance.bloom = 0.05;
  s.appearance.trail = 0.88;
  s.appearance.nebula.intensity = 0.05;
  s.appearance.palette = {
    core: "#EAF1FF",
    inner: "#BBCBE6",
    outer: "#577492",
    accent: "#7A88AE",
  };
  s.appearance.starfield.density = 1.8;
});
