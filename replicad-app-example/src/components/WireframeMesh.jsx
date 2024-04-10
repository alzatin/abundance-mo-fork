import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { WireframeGeometry } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

export default React.memo(function ShapeMeshes({ mesh }) {
  const { invalidate } = useThree();

  const [fullMesh, setFullMesh] = useState([]);

  useLayoutEffect(() => {
    let meshArray = [];
    mesh.map((m) => {
      const wire = new WireframeGeometry();
      // We use the three helpers to synchronise the buffer geometry with the
      // new data from the parameters
      if (m.edges) syncLines(wire, m.edges);
      else if (m.faces) syncLinesFromFaces(wire);

      const thisLines = wire;
      meshArray.push({ lines: thisLines });
    });
    setFullMesh(meshArray);
    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [mesh, invalidate]);

  useEffect(
    () => () => {
      // wire.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <>
      {fullMesh.map((m) => {
        return (
          <group>
            <lineSegments geometry={m.lines}>
              <lineBasicMaterial color={"#3c5a6e"} opacity={".75"} />
            </lineSegments>
          </group>
        );
      })}
    </>
  );
});
