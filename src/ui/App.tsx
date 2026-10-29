import { useEffect, useState } from "react";
import { CanvasStage } from "./CanvasStage";
export function App() {
  const [stats, setStats] = useState(""),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") setVisible((v) => !v);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <CanvasStage onStats={setStats} />
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
          Somewhere,
          <br />
          everything begins.
        </h1>
        <p>
          Twenty thousand stars. One quiet moment.
          <br />
          Watch a universe come to life.
        </p>
      </main>
      <footer>
        <span>
          <i /> VEILED ORCHID CLUSTER <small>NGC — 4217</small>
        </span>
        <span>
          CANVAS EXPLORATION <b>01 / FOUNDATION</b>
        </span>
      </footer>
      {visible && <output className="stats">{stats}</output>}
      <div className="coordinate">
        RA 23h 17m · DEC +61° 32′
        <br />
        SEED 004217
      </div>
    </>
  );
}
