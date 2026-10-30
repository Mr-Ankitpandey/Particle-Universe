import { createPreset } from "./createPreset";
export const cosmicStorm = createPreset((s) => {
  s.name = "Cosmic Storm";
  s.seed = 814;
  s.galaxy.type = "barred";
  s.galaxy.arms = 2;
  s.physics.turbulence = 0.09;
  s.physics.turbulenceScale = 2.5;
  s.appearance.palette = {
    core: "#FFF1FC",
    inner: "#FF68BF",
    outer: "#5BE2D1",
    accent: "#8F54ED",
  };
  s.appearance.colorMode = "velocity";
  s.appearance.trail = 0.83;
  s.appearance.trailStyle = "streak";
  s.behaviors.onIdle = "pulse";
});
