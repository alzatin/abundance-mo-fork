import React, { useRef, useLayoutEffect, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { WireframeGeometry } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

export default React.memo(function ShapeMeshes({ faces, edges }) {
  const { invalidate } = useThree();

  const wire = useRef(new WireframeGeometry());

  useLayoutEffect(() => {
    // We use the three helpers to synchronise the buffer geometry with the
    // new data from the parameters
    if (edges) syncLines(wire.current, edges);
    else if (faces) syncLinesFromFaces(wire.current);

    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [faces, edges, invalidate]);

  useEffect(
    () => () => {
      wire.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <group>
      <lineSegments geometry={wire.current}>
        <lineBasicMaterial color={"#3c5a6e"} opacity={".75"} />
      </lineSegments>
    </group>
  );
});
