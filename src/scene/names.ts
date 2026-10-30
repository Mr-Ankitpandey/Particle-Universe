import type { Rng } from "../engine/core/Rng";
const adjectives = [
  "Veiled",
  "Silent",
  "Velvet",
  "Distant",
  "Lucent",
  "Wandering",
  "Hidden",
  "Opal",
];
const nouns = [
  "Orchid Cluster",
  "Helix",
  "Tidal Bloom",
  "Aurora",
  "Star Garden",
  "Nebula",
  "Starfall",
  "Infinity",
];
export function universeName(rng: Rng) {
  return (
    (adjectives[Math.floor(rng.next() * adjectives.length)] ?? "Silent") +
    " " +
    (nouns[Math.floor(rng.next() * nouns.length)] ?? "Nebula") +
    " · " +
    Math.floor(1000 + rng.next() * 8999)
  );
}
