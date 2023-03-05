import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";

// We import our model as a simple function
import { drawBox, createCircle, createExtrude, createRectangle } from "./cad";

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
    library[id] = createCircle(diameter);
    return true
  });
}

function rectangle(id, x, y) {
  return started.then(() => {
    library[id] = createRectangle(x,y);
    return true
  });
}

function extrude(targetID, inputID, height) {
  return started.then(() => {
    const extrudedShape =library[inputID].clone().extrude(height);
    library[targetID] = extrudedShape;
    return true
  });
}

function move(targetID, inputID, x, y, z) {
  return started.then(() => {
    const movedShape =library[inputID].clone().translate([x, y, z]);
    library[targetID] = movedShape;
    return true
  });
}

function cut(targetID, input1ID, input2ID) {
  console.log("Cut called");
  return started.then(() => {
    const cutShape =library[input1ID].clone().cut(library[input2ID].clone());
    library[targetID] = cutShape;
    return true
  });
}

function generateDisplayMesh(id) {

  return started.then(() => {

    //Try extruding if there is no 3d shape
    if(library[id].mesh == undefined){
      const threeDShape = library[id].clone().extrude(.0001);
      return {
        faces: threeDShape.mesh(),
        edges: threeDShape.meshEdges(),
      };
    }
    else{
      return {
        faces: library[id].mesh(),
        edges: library[id].meshEdges(),
      };
    }
  });
}


// comlink is great to expose your functions within the worker as a simple API
// to your app.
expose({ createBlob, createMesh, circle, rectangle, generateDisplayMesh, extrude, move, cut });
