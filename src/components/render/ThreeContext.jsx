import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Wireframe, Grid, PivotControls } from "@react-three/drei";
import * as THREE from "three";
import InfiniteGrid from "./InfiniteGrid.jsx";
import Controls from "./ThreeControls.jsx";

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

// This is the basics to render a nice looking model user react-three-fiber
//
// The camera is positioned for the model we present (that cannot change size.
// You might need to adjust this with something like the autoadjust from the
// `Stage` component of `drei`
//
// Depending on your needs I would advice not using a light and relying on
// a matcap material instead of the meshStandardMaterial used here.
export default function ext({ children, ...props }) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  let backColor = props.outdatedMesh ? "#ababab" : "#f5f5f5";
  let cameraZoom = props.mesh[0] ? props.mesh[0].cameraZoom : 1;
  console.log("zoom", cameraZoom);

  return (
    <Suspense fallback={null}>
      <Canvas
        id="threeCanvas"
        style={{
          backgroundColor: backColor,
        }}
        dpr={dpr}
        frameloop="demand"
        orthographic={true}
        camera={{
          makeDefault: true,
          near: 0.1,
          far: 9000,
          zoom: cameraZoom,
          position: [3000, 3000, 5000],
        }}
        shadows={true}
      >
        <PivotControls />
        {props.gridParam ? (
          <Grid
            position={[0, 0, 0]}
            args={[10000, 10000]}
            cellColor={"#b6aebf"}
            fadeFrom={0}
            sectionColor={"#BFA301"}
            fadeDistance={5000}
            rotation={[Math.PI / 2, 0, 0]}
            cellSize={10}
            sectionSize={50}
          />
        ) : null}
        {/*props.gridParam ? <InfiniteGrid /> : null*/}
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
