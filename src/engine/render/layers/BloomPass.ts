// A separate quarter-resolution canvas prevents glow from feeding back into trails.
export class BloomPass {
  private frame = 0;
  resize() {
    this.frame = 0;
  }
  render(
    source: HTMLCanvasElement,
    target: CanvasRenderingContext2D,
    strength: number,
  ) {
    if (strength <= 0) {
      target.clearRect(0, 0, target.canvas.width, target.canvas.height);
      return;
    }
    if (this.frame++ % 2 !== 0) return;
    target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    target.globalCompositeOperation = "source-over";
    target.globalAlpha = strength;
    target.filter = "blur(2px)";
    target.drawImage(source, 0, 0, target.canvas.width, target.canvas.height);
    target.filter = "none";
    target.globalAlpha = 1;
  }
}
