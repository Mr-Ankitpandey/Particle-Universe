import { useEffect, useRef } from "react";
import { Engine } from "../engine/Engine";
export function CanvasStage({ onStats }: { onStats: (text: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    background = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current || !background.current) return;
    const engine = new Engine(canvas.current, background.current);
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
          " MS · 20,000 PARTICLES · HIGH",
      );
    }, 500);
    return () => {
      clearInterval(timer);
      removeEventListener("resize", resize);
      observer.disconnect();
      engine.dispose();
    };
  }, [onStats]);
  return (
    <div className="stage">
      <canvas ref={background} aria-hidden="true" />
      <canvas
        ref={canvas}
        role="img"
        aria-label="A luminous four-arm spiral galaxy with twenty thousand stars"
      />
    </div>
  );
}
