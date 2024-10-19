import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Wireframe, Grid, PivotControls } from "@react-three/drei";
import * as THREE from "three";
import Controls from "./ThreeControls.jsx";

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

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
        frameloop="always"
        orthographic={true}
        camera={{
          makeDefault: true,
          near: 0.1,
          pov: 1000,
          far: 9000,
          zoom: cameraZoom, // This is how we position the camera to be closer to the model. Right now it's not adjusting
          position: [3000, 3000, 5000],
        }}
        shadows={true}
      >
        {/** Pivot should probably be scaled up when we figure out zoom */}
        <PivotControls scale={3} />
        {props.gridParam ? (
          <Grid
            position={[0, 0, 0]}
            cellSize={10} // The size of the grid cell, might also want to adjust this based on zoom
            args={[10000, 10000]}
            cellColor={"#b6aebf"}
            fadeFrom={0}
            sectionColor={"#BFA301"}
            fadeDistance={5000}
            rotation={[Math.PI / 2, 0, 0]}
            sectionSize={100}
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
