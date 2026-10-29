export class Rng {
  constructor(private seed: number) {}
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  gaussian(): number {
    return (
      Math.sqrt(-2 * Math.log(Math.max(1e-9, this.next()))) *
      Math.cos(2 * Math.PI * this.next())
    );
  }
}
