export const tools = [
  { id: "attract", label: "Attract", key: "1", icon: "◎" },
  { id: "repel", label: "Repel", key: "2", icon: "↗" },
  { id: "swirl", label: "Swirl", key: "3", icon: "〰" },
  { id: "shockwave", label: "Shockwave", key: "4", icon: "◉" },
  { id: "supernova", label: "Supernova", key: "5", icon: "✳" },
  { id: "pan", label: "Pan", key: "0", icon: "✥" },
] as const;
export type ToolId = (typeof tools)[number]["id"];
export interface PointerSource {
  id: number;
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  screenX: number;
  screenY: number;
  time: number;
  started: number;
  tool: ToolId;
  radius: number;
}
