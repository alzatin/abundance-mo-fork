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

  const gridConfig = {
    cellSize: { value: 1, min: 0, max: 10, step: 0.1 },
    cellThickness: { value: 3, min: 0, max: 5, step: 0.1 },
    cellColor: "#9d4b4b",
    sectionSize: { value: 10, min: 0, max: 10, step: 0.1 },
    sectionThickness: { value: 1.5, min: 0, max: 5, step: 0.1 },
    sectionColor: "#9d4b4b",
    fadeDistance: { value: 100, min: 0, max: 100, step: 1 },
    fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
    followCamera: false,
    infiniteGrid: true,
  };

  return (
    <Suspense fallback={null}>
      <Canvas
        id="threeCanvas"
        style={{
          backgroundColor: backColor,
        }}
        dpr={dpr}
        frameloop="always"
        orthographic={true}
        camera={{
          near: 0.1,
          far: 5000,
          position: [800, 800, 1000],
        }}
        shadows={true}
      >
        <PivotControls />
        {props.gridParam ? (
          <Grid
            position={[0, -0.5, 0]}
            args={[50, 50]}
            cellColor="#BFA301"
            sectionColor="#BFA301"
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
