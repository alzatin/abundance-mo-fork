import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";

// We import our model as a simple function
import { drawBox, createCircle, createExtrude } from "./cad";

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
  console.log("Create mesh ran");
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
  console.log("Called circle function");
  return started.then(() => {
    const cadCircle = createCircle(diameter);
    library[id] = cadCircle;
    console.log("Library: ");
    console.log(library);
    return true
  });
}

function extrude(id, height) {
  return createExtrude(library.id, height);
}

function generateDisplayMesh(id) {
  console.log("UpdateDisplay called");
  console.log(id);
  return started.then(() => {
    console.log("UpdateDisplay ran");
    console.log(library[id]);
    return {
      faces: library[id].mesh(),
      edges: library[id].meshEdges(),
    };
  });
}


// comlink is great to expose your functions within the worker as a simple API
// to your app.
expose({ createBlob, createMesh, circle, generateDisplayMesh });
