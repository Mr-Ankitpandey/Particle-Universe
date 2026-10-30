import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { CanvasStage } from "./CanvasStage";
import { ToolDock } from "./ToolDock";
import { TopBar, randomizeScene } from "./TopBar";
import { SettingsPanel } from "./SettingsPanel";
import { sceneStore, updateScene } from "../state/store";
import type { Engine } from "../engine/Engine";
import type { ToolId } from "../input/tools";
import { keyboard } from "../input/keyboard";
export function App() {
  const [stats, setStats] = useState(""),
    [visible, setVisible] = useState(false),
    [active, setActive] = useState<ToolId>("attract"),
    [toast, setToast] = useState(""),
    [settings, setSettings] = useState(false);
  const name = useStore(sceneStore, (s) => s.config.name),
    seed = useStore(sceneStore, (s) => s.config.seed);
  const engine = useRef<Engine | null>(null),
    activeRef = useRef<ToolId>("attract");
  const onEngine = useCallback((value: Engine | null) => {
    engine.current = value;
    value?.setTool(activeRef.current);
  }, []);
  const select = useCallback((tool: ToolId) => {
    activeRef.current = tool;
    setActive(tool);
    engine.current?.setTool(tool);
    if (tool === "attract" || tool === "repel" || tool === "swirl")
      updateScene((scene) => { scene.physics.pointerMode = tool; });
  }, []);
  useEffect(() => sceneStore.subscribe((state, previous) => {
    const mode = state.config.physics.pointerMode;
    if (mode !== "off" && mode !== previous.config.physics.pointerMode) {
      activeRef.current = mode;
      setActive(mode);
      engine.current?.setTool(mode);
    }
  }), []);
  useEffect(() => keyboard(() => engine.current, select), [select]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))
      )
        return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) sceneStore.getState().redo();
        else sceneStore.getState().undo();
        return;
      }
      if (e.ctrlKey || e.metaKey) return;
      if (e.key.toLowerCase() === "f") setVisible((v) => !v);
      if (e.key.toLowerCase() === "r") randomizeScene(e.shiftKey);
      if (e.key === "Escape") setSettings(false);
    };
    addEventListener("keydown", listener);
    return () => removeEventListener("keydown", listener);
  }, []);
  return (
    <>
      <CanvasStage onStats={setStats} onEngine={onEngine} onToast={setToast} />
      <TopBar
        onSettings={() => setSettings((value) => !value)}
        onStats={() => setVisible((value) => !value)}
      />
      <main className="intro">
        <div className="eyebrow">YOUR OWN LITTLE INFINITY</div>
        <h1>
          A universe.
          <br />
          At your fingertips.
        </h1>
        <p>
          Hold to gather the stars. Scroll to explore.
          <br />
          Choose a power. Make a little chaos.
        </p>
      </main>
      <footer>
        <span>
          <i />
          {name}
          <small>SEED {seed}</small>
        </span>
        <span>HOLD · STIR · DISCOVER</span>
      </footer>
      <ToolDock active={active} onSelect={select} />
      <SettingsPanel
        open={settings}
        onOpenChange={setSettings}
        onPause={() => engine.current?.togglePause()}
        onStep={() => engine.current?.step()}
      />
      {visible && <output className="stats">{stats}</output>}
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </>
  );
}
