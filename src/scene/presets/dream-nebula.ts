import { createPreset } from "./createPreset";
export const dreamNebula = createPreset((s) => {
  s.name = "Dream Nebula";
  s.seed = 663;
  s.galaxy.type = "none";
  s.galaxy.radius = 0.45;
  s.galaxy.rotationSpeed = 0.15;
  s.physics.gravity = 0.2;
  s.physics.flowField.enabled = true;
  s.physics.flowField.strength = 0.065;
  s.physics.flowField.scale = 0.8;
  s.appearance.palette = {
    core: "#FFF0F8",
    inner: "#E0ACF5",
    outer: "#8DDDE4",
    accent: "#F6ADCC",
  };
  s.appearance.trail = 0.9;
  s.appearance.trailStyle = "streak";
  s.appearance.bloom = 0.45;
  s.appearance.nebula.intensity = 0.35;
});
