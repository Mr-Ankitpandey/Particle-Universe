export type QualityTier = "high" | "medium" | "low";
const TIERS: QualityTier[] = ["low", "medium", "high"];
export class PerformanceGovernor {
  ema = 16.67;
  workEma = 10;
  fraction = 1;
  tier: QualityTier = "high";
  lock: "auto" | QualityTier = "auto";
  private slow = 0;
  private fast = 0;
  update(frameMs: number, elapsed: number, workMs = frameMs) {
    this.workEma = this.workEma * 0.95 + workMs * 0.05;
    this.ema = this.ema * 0.95 + Math.min(100, frameMs) * 0.05;
    if (this.lock !== "auto") {
      this.tier = this.lock;
      this.fraction = 1;
      this.slow = 0;
      this.fast = 0;
      return;
    }
    if (this.ema > 19) {
      this.slow += elapsed;
      this.fast = 0;
    } else if (this.ema < 19 && this.workEma < 13) {
      this.fast += elapsed;
      this.slow = 0;
    } else {
      this.slow = 0;
      this.fast = 0;
    }
    if (this.slow > 1.5) {
      if (this.fraction > 0.25)
        this.fraction = Math.max(0.25, this.fraction * 0.85);
      else
        this.tier = TIERS[Math.max(0, TIERS.indexOf(this.tier) - 1)] ?? "low";
      this.slow = 0;
    }
    if (this.fast > 4) {
      if (this.tier !== "high")
        this.tier = TIERS[Math.min(2, TIERS.indexOf(this.tier) + 1)] ?? "high";
      else this.fraction = Math.min(1, this.fraction / 0.85);
      this.fast = 0;
    }
  }
  get maxDpr() {
    return this.tier === "high" ? 2 : this.tier === "medium" ? 1.5 : 1;
  }
}
