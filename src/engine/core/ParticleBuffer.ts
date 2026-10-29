export class ParticleBuffer {
  readonly capacity: number;
  count: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  px: Float32Array;
  py: Float32Array;
  hx: Float32Array;
  hy: Float32Array;
  hue: Float32Array;
  sat: Float32Array;
  lum: Float32Array;
  size: Float32Array;
  life: Float32Array;
  mass: Float32Array;
  flags: Uint8Array;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.count = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.px = new Float32Array(capacity);
    this.py = new Float32Array(capacity);
    this.hx = new Float32Array(capacity);
    this.hy = new Float32Array(capacity);
    this.hue = new Float32Array(capacity);
    this.sat = new Float32Array(capacity);
    this.lum = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.life = new Float32Array(capacity).fill(Infinity);
    this.mass = new Float32Array(capacity).fill(1);
    this.flags = new Uint8Array(capacity);
  }
}
