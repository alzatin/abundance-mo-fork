import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";
import { sketchCircle, sketchRectangle } from "replicad";

// We import our model as a simple function
import { drawBox } from "./cad";

var library = {};

// This is the logic to load the web assembly code into replicad
let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  setOC(OC);

  return true;
};
const started = init();

function createBlob(thickness) {
  // note that you might want to do some caching for more complex models
  return started.then(() => {
    return drawBox(thickness).blobSTEP();
  });
}

function createMesh(thickness) {
  return started.then(() => {
    const box = drawBox(thickness);
    // This is how you get the data structure that the replica-three-helper
    // can synchronize with three BufferGeometry
    return {
      faces: box.mesh(),
      edges: box.meshEdges(),
    };
  });
}

function circle(id, diameter) {
  return started.then(() => {
    library[id] = {geometry: [sketchCircle(diameter/2)], tags: []};
    return true
  });
}

function rectangle(id, x, y) {
  return started.then(() => {
    library[id] = {geometry: [sketchRectangle(x,y)], tags: []};
    return true
  });
}

function extrude(targetID, inputID, height) {
  return started.then(() => {
    const extrudedShape =library[inputID].geometry[0].clone().extrude(height);
    library[targetID] = {geometry: [extrudedShape], tags: library[inputID].tags};
    return true
  });
}

function move(targetID, inputID, x, y, z) {
  return started.then(() => {
    const movedShape =library[inputID].geometry[0].clone().translate([x, y, z]);
    library[targetID] = {geometry: [movedShape], tags: library[inputID].tags};
    return true
  });
}

function cut(targetID, input1ID, input2ID) {
  return started.then(() => {
    const cutShape =library[input1ID].geometry[0].clone().cut(library[input2ID].geometry[0].clone());
    library[targetID] = {geometry: [cutShape], tags: library[input1ID].tags};
    return true
  });
}

function generateDisplayMesh(id) {

  return started.then(() => {
    //Extract the geometry from the library
    const geometry = library[id].geometry[0];

    //Fuse everything if there is an asembly

    //Try extruding if there is no 3d shape
    if(geometry.mesh == undefined){
      const threeDShape = geometry.clone().extrude(.0001);
      return {
        faces: threeDShape.mesh(),
        edges: threeDShape.meshEdges(),
      };
    }
    else{
      return {
        faces: geometry.mesh(),
        edges: geometry.meshEdges(),
      };
    }
  });
}


// comlink is great to expose your functions within the worker as a simple API
// to your app.
expose({ createBlob, createMesh, circle, rectangle, generateDisplayMesh, extrude, move, cut });
