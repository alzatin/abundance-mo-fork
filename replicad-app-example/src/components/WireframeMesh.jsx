import React, { useRef, useLayoutEffect, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { BufferGeometry, WireframeGeometry, LineSegments } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
} from "replicad-threejs-helper";

export default React.memo(function ShapeMeshes({ faces, edges }) {
  const { invalidate } = useThree();

  const body = useRef(new BufferGeometry());
  const lines = useRef(new BufferGeometry());
  const wire = useRef(new WireframeGeometry());

  useLayoutEffect(() => {
    // We use the three helpers to synchronise the buffer geometry with the
    // new data from the parameters
    if (faces) syncFaces(body.current, faces);
    //if (faces) syncFaces(wire.current, faces);

    if (edges) syncLines(lines.current, edges);
    if (edges) syncLines(wire.current, edges);
    else if (faces)
      syncLinesFromFaces(lines.current, body.current, wire.current);

    // We have configured the canvas to only refresh when there is a change,
    // the invalidate function is here to tell it to recompute
    invalidate();
  }, [faces, edges, invalidate]);

  useEffect(
    () => () => {
      body.current.dispose();
      lines.current.dispose();
      wire.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <group>
      <lineSegments geometry={wire.current}>
        <lineBasicMaterial color="#3c5a6e" opacity="1" />
      </lineSegments>
    </group>
  );
});
