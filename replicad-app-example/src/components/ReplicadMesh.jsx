import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { BufferGeometry, WireframeGeometry, LineSegments } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

export default React.memo(function ShapeMeshes({ mesh }) {
  const { invalidate } = useThree();
  const body = useRef(new BufferGeometry());
  const lines = useRef(new BufferGeometry());
  const [fullMesh, setFullMesh] = useState([]);

  useLayoutEffect(() => {
    let meshArray = [];
    mesh.map((m) => {
      // We use the three helpers to synchronise the buffer geometry with the
      // new data from the parameters
      if (m.faces) syncFaces(body.current, m.faces);
      //if (faces) syncFaces(wire.current, faces);

      if (m.edges) syncLines(lines.current, m.edges);
      else if (m.faces) syncLinesFromFaces(lines.current, body.current);

      meshArray.push({ body: body.current, lines: lines.current });
    });
    console.log(meshArray);
    setFullMesh(meshArray);
    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [mesh, invalidate]);

  useEffect(
    () => () => {
      body.current.dispose();
      lines.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <>
      {fullMesh.map((m) => {
        return (
          <group>
            <mesh geometry={m.body}>
              {/* the offsets are here to avoid z fighting between the mesh and the lines */}
              <meshStandardMaterial
                color="red"
                opacity={0.5}
                polygonOffset
                polygonOffsetFactor={2.0}
                polygonOffsetUnits={1.0}
              />
            </mesh>
            <lineSegments geometry={m.lines}>
              <lineBasicMaterial
                color={"#d7d0d9"}
                opacity={0.75}
                linewidth={4}
              />
            </lineSegments>
          </group>
        );
      })}
    </>
  );
});
