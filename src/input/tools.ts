export const tools = [
  { id: "attract", label: "Attract", key: "1", icon: "◎" },
  { id: "repel", label: "Repel", key: "2", icon: "↗" },
  { id: "swirl", label: "Swirl", key: "3", icon: "〰" },
  { id: "shockwave", label: "Shockwave", key: "4", icon: "◉" },
  { id: "supernova", label: "Supernova", key: "5", icon: "✳" },
  { id: "gravityWell", label: "Gravity well", key: "6", icon: "⊕" },
  { id: "blackHole", label: "Black hole", key: "7", icon: "◌" },
  { id: "vortex", label: "Vortex", key: "8", icon: "⟳" },
  { id: "freeze", label: "Freeze", key: "9", icon: "❄" },
  { id: "pan", label: "Pan", key: "0", icon: "✥" },
] as const;
export type ToolId = (typeof tools)[number]["id"];
export interface PointerSource {
  id: number;
  entityId: number;
  unfreeze: boolean;
  longPress: number;
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
