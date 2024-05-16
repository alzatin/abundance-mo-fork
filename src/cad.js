import { sketchCircle, sketchRectangle } from "replicad";

// The replicad code! Not much there!
export function drawBox(thickness) {
  return sketchCircle(20)
    .extrude(20)
    .shell(thickness, (f) => f.inPlane("XY", 20));
}
