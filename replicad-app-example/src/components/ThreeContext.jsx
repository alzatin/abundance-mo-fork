import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.
THREE.Object3D.DefaultUp.set(0, 0, 1);

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

// This is the basics to render a nice looking model user react-three-fiber
//
// The camera is positioned for the model we present (that cannot change size.
// You might need to adjust this with something like the autoadjust from the
// `Stage` component of `drei`
//
// Depending on your needs I would advice not using a light and relying on
// a matcap material instead of the meshStandardMaterial used here.
export default function ThreeContext({ children, ...props }) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  const size = useWindowSize();

  return (
    <Suspense fallback={null}>
      <div>
        {size.width}px / {size.height}px
      </div>
      <Canvas
        id = "threeCanvas"
        style={{
          backgroundColor: "#f5f5f5",
          width: size.width*.6,
          height: size.height*.5,
        }}
        dpr={dpr}
        frameloop="demand"
        camera={{ position: [20, 40, 50] }}
        {...props}
      >
        <OrbitControls />
        <ambientLight />
        <pointLight position={[100, 100, 100]} />
        {children}
      </Canvas>
    </Suspense>
  );
}
