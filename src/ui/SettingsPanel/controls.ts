export type Tab = "Galaxy" | "Physics" | "Appearance" | "Simulation" | "Audio";
export interface NumericControl {
  path: string;
  label: string;
  min: number;
  max: number;
  step: number;
}
export const controls: Record<Tab, NumericControl[]> = {
  Galaxy: [
    {
      path: "galaxy.particleCount",
      label: "Particles",
      min: 1000,
      max: 60000,
      step: 1000,
    },
    { path: "galaxy.arms", label: "Spiral arms", min: 1, max: 8, step: 1 },
    { path: "galaxy.armTwist", label: "Arm twist", min: 0, max: 12, step: 0.1 },
    {
      path: "galaxy.armSpread",
      label: "Arm spread",
      min: 0,
      max: 1,
      step: 0.01,
    },
    { path: "galaxy.coreSize", label: "Core size", min: 0, max: 1, step: 0.01 },
    {
      path: "galaxy.radius",
      label: "Galaxy radius",
      min: 0.1,
      max: 1.2,
      step: 0.01,
    },
    {
      path: "galaxy.rotationSpeed",
      label: "Rotation speed",
      min: -2,
      max: 2,
      step: 0.05,
    },
  ],
  Physics: [
    { path: "physics.gravity", label: "Gravity", min: 0, max: 5, step: 0.05 },
    { path: "physics.drag", label: "Drag", min: 0, max: 3, step: 0.01 },
    {
      path: "physics.turbulence",
      label: "Turbulence",
      min: 0,
      max: 0.5,
      step: 0.005,
    },
    {
      path: "physics.turbulenceScale",
      label: "Turbulence scale",
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      path: "physics.pointerStrength",
      label: "Pointer strength",
      min: 0,
      max: 3,
      step: 0.05,
    },
    {
      path: "physics.pointerRadius",
      label: "Pointer radius",
      min: 0.05,
      max: 2,
      step: 0.05,
    },
    {
      path: "physics.flowField.strength",
      label: "Flow strength",
      min: 0,
      max: 0.5,
      step: 0.005,
    },
    {
      path: "physics.flowField.scale",
      label: "Flow scale",
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      path: "physics.flowField.evolveSpeed",
      label: "Flow evolution",
      min: 0,
      max: 2,
      step: 0.01,
    },
  ],
  Appearance: [
    {
      path: "appearance.particleSize",
      label: "Particle size",
      min: 0.2,
      max: 5,
      step: 0.1,
    },
    {
      path: "appearance.sizeVariance",
      label: "Size variance",
      min: 0,
      max: 1,
      step: 0.01,
    },
    { path: "appearance.glow", label: "Glow", min: 0, max: 1, step: 0.01 },
    { path: "appearance.bloom", label: "Bloom", min: 0, max: 1, step: 0.01 },
    {
      path: "appearance.trail",
      label: "Trail persistence",
      min: 0,
      max: 0.98,
      step: 0.01,
    },
    {
      path: "appearance.nebula.intensity",
      label: "Nebula intensity",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      path: "appearance.nebula.hueShift",
      label: "Nebula hue",
      min: -180,
      max: 180,
      step: 1,
    },
    {
      path: "appearance.starfield.density",
      label: "Starfield density",
      min: 0,
      max: 2,
      step: 0.05,
    },
    {
      path: "appearance.starfield.twinkle",
      label: "Twinkle",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      path: "appearance.starfield.parallax",
      label: "Parallax",
      min: 0,
      max: 1,
      step: 0.01,
    },
  ],
  Simulation: [
    {
      path: "physics.timeScale",
      label: "Time scale",
      min: 0.1,
      max: 3,
      step: 0.1,
    },
  ],
  Audio: [],
};
export function readPath(root: unknown, path: string): unknown {
  let value = root;
  for (const key of path.split(".")) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}
export function writePath(root: unknown, path: string, value: unknown) {
  const keys = path.split(".");
  let object = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!key || !object || typeof object !== "object") return;
    object = (object as Record<string, unknown>)[key];
  }
  const key = keys[keys.length - 1];
  if (key && object && typeof object === "object")
    (object as Record<string, unknown>)[key] = value;
}
