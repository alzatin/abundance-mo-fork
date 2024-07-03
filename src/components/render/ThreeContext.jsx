import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Wireframe } from "@react-three/drei";
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

  return (
    <Suspense fallback={null}>
      <Canvas
        id="threeCanvas"
        style={{
          backgroundColor: "#f5f5f5",
        }}
        dpr={dpr}
        frameloop="demand"
        orthographic={true}
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [50, 50, 60],
          zoom: 7,
        }}
        shadows={true}
      >
        {props.gridParam ? <InfiniteGrid /> : null}
        <Controls axesParam={props.axesParam} enableDamping={false}></Controls>
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 50, 50]} />

        {children}
      </Canvas>
    </Suspense>
  );
}
