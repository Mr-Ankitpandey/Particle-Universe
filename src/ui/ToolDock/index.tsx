import {
  Magnet,
  MoveUpRight,
  Orbit,
  Radio,
  Sun,
  Target,
  Circle,
  RotateCw,
  Snowflake,
  Move,
  type LucideIcon,
} from "lucide-react";
import { tools, type ToolId } from "../../input/tools";
const icons: Record<ToolId, LucideIcon> = {
  attract: Magnet,
  repel: MoveUpRight,
  swirl: Orbit,
  shockwave: Radio,
  supernova: Sun,
  gravityWell: Target,
  blackHole: Circle,
  vortex: RotateCw,
  freeze: Snowflake,
  pan: Move,
};
export function ToolDock({
  active,
  onSelect,
}: {
  active: ToolId;
  onSelect: (tool: ToolId) => void;
}) {
  return (
    <nav className="tool-dock" aria-label="Cosmic tools">
      {tools.map((tool) => {
        const Icon = icons[tool.id];
        return (
          <button
            key={tool.id}
            aria-label={tool.label}
            aria-pressed={active === tool.id}
            title={tool.label + " · " + tool.key}
            onClick={() => onSelect(tool.id)}
          >
            <Icon size={21} />
            <span>{tool.label}</span>
            <kbd>{tool.key}</kbd>
          </button>
        );
      })}
    </nav>
  );
}
