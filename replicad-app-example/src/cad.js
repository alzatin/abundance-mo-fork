import { sketchCircle, sketchRectangle } from "replicad";

// The replicad code! Not much there!
export function drawBox(thickness) {
  return sketchCircle(20)
    .extrude(20)
    .shell(thickness, (f) => f.inPlane("XY", 20));
}

export function createCircle(diameter){
  const circle = sketchCircle(diameter/2);
  return circle;
}

export function createRectangle(x,y){
  const circle = sketchRectangle(x,y);
  return circle;
}

export function createExtrude(geometry, height){
  return geometry.extrude(height);
}