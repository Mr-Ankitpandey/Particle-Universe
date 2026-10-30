import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { Dices, Undo2, Redo2, SlidersHorizontal, Activity } from "lucide-react";
import { sceneStore, updateScene } from "../../state/store";
import { presets } from "../../scene/presets";
import { randomize } from "../../scene/randomize";
export function randomizeScene(colorsOnly = false) {
  const seed = Math.floor(Math.random() * 4294967295);
  sceneStore
    .getState()
    .setConfig(randomize(seed, sceneStore.getState().config, colorsOnly));
}
export function TopBar({
  onSettings,
  onStats,
}: {
  onSettings: () => void;
  onStats: () => void;
}) {
  const name = useStore(sceneStore, (s) => s.config.name),
    preset = useStore(sceneStore, (s) => s.preset),
    undoCount = useStore(sceneStore, (s) => s.undoCount),
    redoCount = useStore(sceneStore, (s) => s.redoCount);
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Particle Universe home">
        ✳
        <span>
          PARTICLE <b>UNIVERSE</b>
        </span>
      </a>
      <input
        className="universe-name"
        aria-label="Universe name"
        value={draft}
        maxLength={80}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() =>
          updateScene((scene) => {
            scene.name = draft.trim() || "Untitled Universe";
          })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <select
        aria-label="Preset"
        value={Math.max(
          0,
          presets.findIndex((p) => p.name === preset.name),
        )}
        onChange={(e) => {
          const scene = presets[Number(e.target.value)];
          if (scene) sceneStore.getState().loadPreset(scene);
        }}
      >
        {presets.map((scene, index) => (
          <option key={scene.name} value={index}>
            {scene.name}
          </option>
        ))}
      </select>
      <div className="topbar-actions">
        <button
          className="icon-button"
          aria-label="Randomize"
          title="Randomize · R (Shift: colors only)"
          onClick={(e) => randomizeScene(e.shiftKey)}
        >
          <Dices size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Undo"
          title="Undo"
          disabled={!undoCount}
          onClick={() => sceneStore.getState().undo()}
        >
          <Undo2 size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Redo"
          title="Redo"
          disabled={!redoCount}
          onClick={() => sceneStore.getState().redo()}
        >
          <Redo2 size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Settings"
          onClick={onSettings}
        >
          <SlidersHorizontal size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Live observatory"
          onClick={onStats}
        >
          <Activity size={18} />
        </button>
      </div>
    </header>
  );
}
