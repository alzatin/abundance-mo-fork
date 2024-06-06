import React from "react";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";

const Controls = React.memo(
  React.forwardRef(function Controls(
    { axesParam, enableDamping },
    controlsRef
  ) {
    return (
      <>
        <OrbitControls
          ref={controlsRef}
          panSpeed={1.5}
          zoomSpeed={0.5}
          enableDamping={enableDamping}
        />
        {axesParam && (
          <GizmoHelper
            alignment={"bottom-right"}
            margin={[70, 100]}
            onTarget={() => {
              return controlsRef?.current?.target;
            }}
            onUpdate={() => {
              console.log(controlsRef.current);
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
