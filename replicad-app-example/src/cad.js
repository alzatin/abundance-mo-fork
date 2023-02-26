import { sketchCircle } from "replicad";

// The replicad code! Not much there!
export function drawBox(thickness) {
  return sketchCircle(20)
    .extrude(20)
    .shell(thickness, (f) => f.inPlane("XY", 20));
}

export function createCircle(diameter){
  console.log("CreateCircle ran");
  const circle = sketchCircle(diameter/2).extrude(.0001);
  return circle;
}

export function createExtrude(geometry, height){
  return geometry.extrude(height);
}