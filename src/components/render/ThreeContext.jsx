import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Wireframe,
  Grid,
  PivotControls,
  OrthographicCamera,
} from "@react-three/drei";
import * as THREE from "three";
import Controls from "./ThreeControls.jsx";
import globalvariables from "../../js/globalvariables.js";
import { sec } from "mathjs";

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export default function ext({ children, ...props }) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  let cameraZoom = props.cameraZoom;
  let backColor = props.outdatedMesh ? "#ababab" : "#f5f5f5";

  function PivotControl() {
    let newScale = calculateInverseScale(cameraZoom);
    return <PivotControls scale={newScale} />;
  }
  function SceneCamera() {
    return (
      <OrthographicCamera
        makeDefault={true}
        near={0.1}
        pov={1000}
        far={9000}
        //zoom={cameraZoom}
        position={[3000, 3000, 5000]}
      />
    );
  }

  function calculateInverseScale(zoom) {
    const baseScale = 21; // The base scale value when zoom is 1
    return baseScale / zoom;
  }
  const projectUnit = globalvariables.topLevelMolecule
    ? globalvariables.topLevelMolecule.unitsKey
    : "MM";
  let cellSize;
  let sectionSize;
  if (projectUnit == "MM") {
    cellSize = 10;
    sectionSize = 100;
  } else if (projectUnit == "Inches") {
    cellSize = 1;
    sectionSize = 10;
  }

  return (
    <Suspense fallback={null}>
      <Canvas
        id="threeCanvas"
        style={{
          backgroundColor: backColor,
        }}
        dpr={dpr}
        frameloop="always"
        shadows={true}
      >
        <OrthographicCamera
          makeDefault={true}
          near={0.1}
          pov={1000}
          far={9000}
          zoom={cameraZoom}
          position={[3000, 3000, 5000]}
        />
        {props.axesParam ? <PivotControl /> : null}
        {props.gridParam ? (
          <Grid
            position={[0, 0, 0]}
            cellSize={cellSize}
            args={[10000, 10000]}
            cellColor={"#b6aebf"}
            fadeFrom={0}
            sectionColor={"#BFA301"}
            fadeDistance={5000}
            rotation={[Math.PI / 2, 0, 0]}
            sectionSize={sectionSize}
          />
        ) : null}
        <Controls axesParam={props.axesParam} enableDamping={false}></Controls>
        {!props.outdatedMesh ? (
          <ambientLight intensity={0.9} />
        ) : (
          <ambientLight intensity={0.4} />
        )}
        {children}
      </Canvas>
    </Suspense>
  );
}
