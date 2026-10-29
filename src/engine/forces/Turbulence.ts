import { FlowField } from "./FlowField";
// Independent seeded curl field at a smaller spatial scale.
export class Turbulence extends FlowField {
  constructor() {
    super(8971);
    this.scale = 4;
    this.strength = 0.025;
    this.evolveSpeed = 0.25;
  }
}
