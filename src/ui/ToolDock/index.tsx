import { tools, type ToolId } from "../../input/tools";
export function ToolDock({
  active,
  onSelect,
}: {
  active: ToolId;
  onSelect: (tool: ToolId) => void;
}) {
  return (
    <nav className="tool-dock" aria-label="Cosmic tools">
      {tools.map((tool) => (
        <button
          key={tool.id}
          aria-label={tool.label}
          aria-pressed={active === tool.id}
          title={tool.label + " · " + tool.key}
          onClick={() => onSelect(tool.id)}
        >
          <span className="tool-icon">{tool.icon}</span>
          <span>{tool.label}</span>
          <kbd>{tool.key}</kbd>
        </button>
      ))}
    </nav>
  );
}
