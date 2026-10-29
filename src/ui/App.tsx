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
      <CanvasStage onStats={setStats} onEngine={onEngine} />
      <header>
        <a className="brand" href="/">
          ✳{" "}
          <span>
            PARTICLE <b>UNIVERSE</b>
          </span>
        </a>
        <span className="edition">AN INTERACTIVE COSMIC PLAYGROUND</span>
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
