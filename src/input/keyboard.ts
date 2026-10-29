import { tools, type ToolId } from "./tools";
import type { Engine } from "../engine/Engine";
export function keyboard(
  engine: () => Engine | null,
  select: (id: ToolId) => void,
) {
  const listener = (event: KeyboardEvent) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))
    )
      return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const instance = engine();
    if (!instance) return;
    const tool = tools.find((t) => t.key === event.key);
    if (tool) {
      select(tool.id);
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      instance.togglePause();
    } else if (event.key === ".") instance.step();
    else if (event.key === "-" || event.key === "=") {
      instance.camera.zoomAt(
        event.key === "=" ? 1.15 : 1 / 1.15,
        innerWidth / 2,
        innerHeight / 2,
      );
    } else if (event.key === "Backspace") {
      event.preventDefault();
      instance.camera.reset();
    } else if (event.key === "[" || event.key === "]") {
      instance.input.radius = Math.max(
        0.1,
        Math.min(
          1.5,
          instance.input.radius + (event.key === "]" ? 0.05 : -0.05),
        ),
      );
    }
  };
  addEventListener("keydown", listener);
  return () => removeEventListener("keydown", listener);
}
