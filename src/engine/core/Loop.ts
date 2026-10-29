export class Accumulator {
  remainder = 0;
  advance(gap: number, step: (dt: number) => void) {
    this.remainder += Math.min(0.25, Math.max(0, gap));
    let n = 0;
    while (this.remainder >= 1 / 60 && n < 4) {
      step(1 / 60);
      this.remainder -= 1 / 60;
      n++;
    }
    if (n === 4) this.remainder = 0;
    return n;
  }
}
export class Loop {
  private id = 0;
  private previous = 0;
  private accumulator = new Accumulator();
  private paused = false;
  private hidden = false;
  fps = 60;
  frameMs = 16.67;
  constructor(
    private step: (dt: number) => void,
    private render: (time: number) => void,
  ) {}
  private frame = (now: number) => {
    const gap = this.previous ? (now - this.previous) / 1000 : 1 / 60;
    this.previous = now;
    if (!this.paused && !this.hidden) {
      this.accumulator.advance(gap, this.step);
      this.render(now / 1000);
      this.frameMs = this.frameMs * 0.95 + gap * 1000 * 0.05;
      this.fps = 1000 / this.frameMs;
    }
    this.id = requestAnimationFrame(this.frame);
  };
  private visibility = () => {
    this.hidden = document.hidden;
    this.previous = 0;
  };
  start() {
    document.addEventListener("visibilitychange", this.visibility);
    this.id = requestAnimationFrame(this.frame);
  }
  togglePause() {
    this.paused = !this.paused;
  }
  get isPaused() {
    return this.paused;
  }
  stepFrame() {
    if (this.paused) {
      this.step(1 / 60);
      this.render(performance.now() / 1000);
    }
  }
  dispose() {
    cancelAnimationFrame(this.id);
    document.removeEventListener("visibilitychange", this.visibility);
  }
}
