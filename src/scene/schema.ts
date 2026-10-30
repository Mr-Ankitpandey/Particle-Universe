import { z } from "zod";
const n = (min: number, max: number) => z.number().finite().min(min).max(max);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const shapeIds = [
  "heart",
  "star",
  "spiral",
  "infinity",
  "ring",
  "crescent",
  "planet",
  "dna",
  "constellation",
] as const;
export const morphTargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    text: z.string().min(1).max(40),
    font: z.string().min(1).max(80),
  }),
  z.object({ kind: z.literal("shape"), shape: z.enum(shapeIds) }),
  z.object({ kind: z.literal("image"), ref: z.string().max(500000) }),
]);
export const entitySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("gravityWell"),
    x: n(-1, 1),
    y: n(-1, 1),
    strength: n(0.001, 2),
    radius: n(0.02, 2),
  }),
  z.object({
    kind: z.literal("blackHole"),
    x: n(-1, 1),
    y: n(-1, 1),
    mass: n(0.1, 8),
  }),
  z.object({
    kind: z.literal("vortex"),
    x: n(-1, 1),
    y: n(-1, 1),
    strength: n(0.001, 2),
    radius: n(0.02, 2),
    clockwise: z.boolean(),
  }),
]);
export const sceneSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(80),
  seed: n(0, 4294967295).int(),
  galaxy: z.object({
    type: z.enum(["spiral", "elliptical", "ring", "barred", "none"]),
    particleCount: n(1000, 60000).int(),
    arms: n(1, 8).int(),
    armTwist: n(0, 12),
    armSpread: n(0, 1),
    coreSize: n(0, 1),
    radius: n(0.1, 1.2),
    rotationSpeed: n(-2, 2),
  }),
  physics: z.object({
    gravity: n(0, 5),
    drag: n(0, 3),
    turbulence: n(0, 2),
    turbulenceScale: n(0.1, 10),
    pointerMode: z.enum(["attract", "repel", "swirl", "off"]),
    pointerStrength: n(0, 3),
    pointerRadius: n(0.05, 2),
    flowField: z.object({
      enabled: z.boolean(),
      strength: n(0, 2),
      scale: n(0.1, 10),
      evolveSpeed: n(0, 2),
    }),
    timeScale: n(0.1, 3),
  }),
  appearance: z.object({
    palette: z.object({ core: hex, inner: hex, outer: hex, accent: hex }),
    background: z.object({ top: hex, bottom: hex }),
    particleSize: n(0.2, 5),
    sizeVariance: n(0, 1),
    glow: n(0, 1),
    bloom: n(0, 1),
    trail: n(0, 0.98),
    trailStyle: z.enum(["fade", "streak"]),
    colorMode: z.enum(["radial", "velocity", "palette", "image"]),
    nebula: z.object({
      enabled: z.boolean(),
      intensity: n(0, 1),
      hueShift: n(-180, 180),
    }),
    starfield: z.object({
      density: n(0, 2),
      twinkle: n(0, 1),
      parallax: n(0, 1),
    }),
  }),
  entities: z.array(entitySchema).max(12),
  behaviors: z.object({
    onClick: z.enum(["shockwave", "supernova", "spawn", "none"]),
    onIdle: z.enum(["drift", "pulse", "none"]),
    morph: z
      .object({
        target: morphTargetSchema,
        holdSeconds: n(1, 60),
        loop: z.boolean(),
      })
      .optional(),
  }),
  audio: z
    .object({
      reactive: z.boolean(),
      bassTo: z.enum(["pulse", "rotation", "size", "none"]),
      highsTo: z.enum(["sparkle", "hue", "none"]),
    })
    .optional(),
});
export type SceneConfig = z.infer<typeof sceneSchema>;
export type SceneEntity = z.infer<typeof entitySchema>;
export type MorphTarget = z.infer<typeof morphTargetSchema>;
export type ShapeId = (typeof shapeIds)[number];
