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
    // const extrudedShape =library[inputID].geometry[0].clone().extrude(height);
    // library[targetID] = {geometry: [extrudedShape], tags: library[inputID].tags};
    const extrudedShape = actOnLeafs(library[inputID], "extrude", [height]);
    console.log("Extruded shape:")
    console.log(extrudedShape)
    library[targetID] = extrudedShape
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

function assembly(targetID, inputIDs) {
  return started.then(() => {
    const assembly = [];
    for (let i = 0; i < inputIDs.length; i++) {
      assembly.push(library[inputIDs[i]]);
    }
    library[targetID] = {geometry: assembly, tags: []};
    return true
  });
}

function actOnLeafs(assembly, action, args){
  console.log("Acting on leafs")
  //This is a leaf
  if(assembly.geometry.length == 1 && assembly.geometry[0].geometry == undefined){
    console.log("This is a leaf");
    return {geometry: [assembly.geometry[0].clone()[action](...args)], tags: assembly.tags};
  }
  //This is a branch
  else{
    let transformedAssembly = [];
    assembly.geometry.forEach(subAssembly => {
      transformedAssembly.push(actOnLeafs(subAssembly, action))
    })
    return {geometry: transformedAssembly, tags: assembly.tags};
  }
}

function flattenAssembly(assembly) {
  var flattened = [];
  //This is a leaf
  if(assembly.geometry.length == 1 && assembly.geometry[0].geometry == undefined){
    flattened.push(assembly.geometry[0])
    return flattened;
  }
  //This is a branch
  else{
    assembly.geometry.forEach(subAssembly => {
      flattened.push(...flattenAssembly(subAssembly))
    })
    return flattened;
  }

}

function chainFuse(chain){
  let fused = chain[0].clone()
  for (let i = 1; i < chain.length; i++) {
    fused = fused.fuse(chain[i])
  }
  return fused
}

function generateDisplayMesh(id) {

  return started.then(() => {

    //Flatten the assembly to remove heirarcy
    const flattened = flattenAssembly(library[id]);

    //Here we need to extrude anything which isn't already 3D and clone everything
    var cleanedGeometry = []
    flattened.forEach(pieceOfGeometry => {
      if(pieceOfGeometry.mesh == undefined){
        cleanedGeometry.push(pieceOfGeometry.clone().extrude(.0001));
      }
      else{
        cleanedGeometry.push(pieceOfGeometry)
      }
    })

    let geometry = chainFuse(cleanedGeometry);

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
expose({ createBlob, createMesh, circle, rectangle, generateDisplayMesh, extrude, move, cut, assembly });
