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
  //const body = useRef(new BufferGeometry());
  //const lines = useRef(new BufferGeometry());

  const [fullMesh, setFullMesh] = useState([]);

  useLayoutEffect(() => {
    let meshArray = [];
    console.log(mesh);

    mesh.map((m) => {
      const body = new BufferGeometry();
      const lines = new BufferGeometry();
      // We use the three helpers to synchronise the buffer geometry with the
      // new data from the parameters
      if (m.faces) syncFaces(body, m.faces);
      //if (faces) syncFaces(wire.current, faces);

      if (m.edges) syncLines(lines, m.edges);
      else if (m.faces) syncLinesFromFaces(lines, body);

      const thisBody = body;
      const thisLines = lines;
      const thisColor = m.color;
      meshArray.push({ body: thisBody, lines: thisLines, color: thisColor });
    });
    console.log(meshArray);
    setFullMesh(meshArray);
    console.log(fullMesh[0] == fullMesh[1]);
    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [mesh, invalidate]);

  useEffect(
    () => () => {
      //body.current.dispose();
      //lines.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <>
      {fullMesh.map((m) => {
        return (
          <group>
            {console.log(m.color)}
            <mesh geometry={m.body}>
              {/* the offsets are here to avoid z fighting between the mesh and the lines */}
              <meshStandardMaterial
                color={m.color}
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
