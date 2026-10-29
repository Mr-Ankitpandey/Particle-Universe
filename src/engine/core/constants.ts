// World units are normalized to galaxy radius; time is in seconds.
export const ORBITAL_GRAVITY = 0.002;
export const CORE_SOFTENING = 0.09;
export const IGNITION_SECONDS = 2.5;
export const DRAG_RATE = 0.03;
export function angularSpeed(radiusSquared: number) {
  return Math.sqrt(ORBITAL_GRAVITY / (radiusSquared + CORE_SOFTENING));
}
