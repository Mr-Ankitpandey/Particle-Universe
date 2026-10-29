import { memo, useEffect, useRef } from "react";
import { Engine } from "../engine/Engine";
export const CanvasStage = memo(function CanvasStage({
  onStats,
  onEngine,
  onToast,
}: {
  onStats: (text: string) => void;
  onEngine: (engine: Engine | null) => void;
  onToast: (message: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    background = useRef<HTMLCanvasElement>(null),
    overlay = useRef<HTMLCanvasElement>(null),
    nebula = useRef<HTMLCanvasElement>(null),
    bloom = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (
      !canvas.current ||
      !background.current ||
      !overlay.current ||
      !nebula.current ||
      !bloom.current
    )
      return;
    const engine = new Engine(
      canvas.current,
      background.current,
      overlay.current,
      nebula.current,
      bloom.current,
      onToast,
    );
    onEngine(engine);
    const resize = () =>
      engine.resize(innerWidth, innerHeight, devicePixelRatio);
    resize();
    addEventListener("resize", resize);
    let lastDpr = devicePixelRatio;
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.current);
    engine.start();
    const timer = setInterval(() => {
      if (lastDpr !== devicePixelRatio) {
        lastDpr = devicePixelRatio;
        resize();
      }
      const s = engine.getStats();
      onStats(
        s.fps.toFixed(0) +
          " FPS · " +
          s.frameMs.toFixed(1) +
          " MS · 20,000 PARTICLES · HIGH" +
          (s.paused ? " · PAUSED" : ""),
      );
    }, 500);
    return () => {
      clearInterval(timer);
      removeEventListener("resize", resize);
      observer.disconnect();
      engine.dispose();
      onEngine(null);
    };
  }, [onStats, onEngine, onToast]);
  return (
    <div className="stage">
      <canvas ref={background} aria-hidden="true" />
      <canvas ref={nebula} aria-hidden="true" />
      <canvas
        ref={canvas}
        role="img"
        aria-label="An interactive four-arm spiral galaxy with twenty thousand stars"
      />
      <canvas ref={bloom} className="bloom" aria-hidden="true" />
      <canvas ref={overlay} className="effects" aria-hidden="true" />
    </div>
  );
});
