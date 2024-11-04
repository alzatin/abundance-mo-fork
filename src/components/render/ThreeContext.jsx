import React, { Suspense, useRef, useEffect, useState } from "react";
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

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export default function ext({ children, ...props }) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  let cameraZoom = props.cameraZoom;
  let backColor = props.outdatedMesh ? "#ababab" : "#f5f5f5";

  const cameraRef = useRef();
  const gridRef = useRef();
  const [gridScale, setGridScale] = useState(1);

  function PivotControl() {
    let newScale = calculateInverseScale(cameraZoom);
    console.log("newScale", newScale);
    return <PivotControls disableRotations={true} scale={gridScale / 1.5} />;
  }

  function calculateInverseScale(zoom) {
    const baseScale = 21; // The base scale value when zoom is 1
    return baseScale / zoom;
  }

  const [cellSection, setCellSection] = useState(100);
  const projectUnit = globalvariables.topLevelMolecule
    ? globalvariables.topLevelMolecule.unitsKey
    : "MM";

  useEffect(() => {
    setCellSection(gridScale);
    console.log("gridScale", gridScale);
  }, [gridScale]);

  let previousZoomLevel = cameraZoom;
  window.addEventListener("wheel", (e) => {
    if (cameraRef.current) {
      // Check if the zoom level change is greater than 5 points
      if (Math.abs(cameraRef.current.zoom - previousZoomLevel) > 0.5) {
        previousZoomLevel = cameraRef.current.zoom; // Update the previous zoom level

        setGridScale(50 / cameraRef.current.zoom);
      }
    }
  });

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
          ref={cameraRef}
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
            ref={gridRef}
            position={[0, 0, 0]}
            cellSize={cellSection}
            args={[10000, 10000]}
            cellColor={"#b6aebf"}
            fadeFrom={0}
            sectionColor={"#BFA301"}
            fadeDistance={5000}
            rotation={[Math.PI / 2, 0, 0]}
            sectionSize={cellSection}
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
