import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasStage } from "./CanvasStage";
import { ToolDock } from "./ToolDock";
import type { Engine } from "../engine/Engine";
import type { ToolId } from "../input/tools";
import { keyboard } from "../input/keyboard";
export function App() {
  const [stats, setStats] = useState(""),
    [visible, setVisible] = useState(false),
    [active, setActive] = useState<ToolId>("attract");
  const engine = useRef<Engine | null>(null);
  const [toast, setToast] = useState(""),
    [fields, setFields] = useState(false);
  const [options, setOptions] = useState({
    bloom: 0.12,
    nebula: true,
    flow: false,
    turbulence: false,
    streak: false,
  });
  useEffect(() => {
    engine.current?.setFields(options);
  }, [options]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);
  const onEngine = useCallback((value: Engine | null) => {
    engine.current = value;
  }, []);
  const select = useCallback((tool: ToolId) => {
    setActive(tool);
    engine.current?.setTool(tool);
  }, []);
  useEffect(() => keyboard(() => engine.current, select), [select]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "f" &&
        !(e.target instanceof HTMLInputElement)
      )
        setVisible((v) => !v);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <CanvasStage onStats={setStats} onEngine={onEngine} onToast={setToast} />
      <header>
        <a className="brand" href="/">
          ✳{" "}
          <span>
            PARTICLE <b>UNIVERSE</b>
          </span>
        </a>
        <span className="edition">AN INTERACTIVE COSMIC PLAYGROUND</span>
        <button onClick={() => setFields((v) => !v)} aria-expanded={fields}>
          Fields
        </button>
        <button onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
          Live observatory <i />
        </button>
      </header>
      <main>
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
          <i /> VEILED ORCHID CLUSTER <small>NGC — 4217</small>
        </span>
        <span>HOLD · STIR · DISCOVER</span>
      </footer>
      {fields && (
        <aside className="field-panel">
          <h2>Cosmic fields</h2>
          <p>
            Place objects with tools 6–8. Drag to move, scroll to resize,
            right-click or hold to remove.
          </p>
          <label>
            Bloom{" "}
            <input
              aria-label="Bloom"
              type="range"
              min="0"
              max=".35"
              step=".01"
              value={options.bloom}
              onChange={(e) =>
                setOptions({ ...options, bloom: Number(e.target.value) })
              }
            />
          </label>
          {(["nebula", "flow", "turbulence", "streak"] as const).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(e) =>
                  setOptions({ ...options, [key]: e.target.checked })
                }
              />
              {key === "flow"
                ? "Curl-noise flow"
                : key === "streak"
                  ? "Streak trails"
                  : key}
            </label>
          ))}
          <p>
            Freeze: brush to hold stars, Shift to unfreeze. Space thaws all
            frozen stars.
          </p>
        </aside>
      )}
      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
      <ToolDock active={active} onSelect={select} />
      {visible && <output className="stats">{stats}</output>}
      <div className="coordinate">
        RA 23h 17m · DEC +61° 32′
        <br />
        SEED 004217
      </div>
    </>
  );
}
