import React, { useRef } from "react";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";

const Controls = React.memo(
  React.forwardRef(function Controls(
    { hideGizmo, enableDamping },
    controlsRef
  ) {
    return (
      <>
        <OrbitControls ref={controlsRef} enableDamping={enableDamping} />
        {!hideGizmo && (
          <GizmoHelper
            alignment={"bottom-right"}
            margin={[70, 100]}
            onTarget={() => {
              return controlsRef?.current?.target;
            }}
            onUpdate={() => {
              controlsRef.current?.update();
            }}
          >
            <GizmoViewport font="18px Inter var, HKGrotesk, sans-serif" />
          </GizmoHelper>
        )}
      </>
    );
  })
);

export default Controls;
