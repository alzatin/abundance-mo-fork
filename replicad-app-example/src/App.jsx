import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import FileSaver from "file-saver";
import { wrap } from "comlink";

import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import TodoList from "./TodoList.jsx";

import cadWorker from "./worker.js?worker";
const cad = wrap(new cadWorker());

export default function ReplicadApp() {
  const [size, setSize] = useState(5);

  const downloadModel = async () => {
    const blob = await cad.createBlob(size);
    FileSaver.saveAs(blob, "thing.step");
  };

  const [mesh, setMesh] = useState(null);

  useEffect(() => {
    cad.createMesh(size).then((m) => setMesh(m));
  }, [size]);

  return (
    <main>
      <h1>
        A{" "}
        <a
          href="https://replicad.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create
        </a>{" "}
        sample app
      </h1>
      <p>
        You can find the code for this app{" "}
        <a
          href="https://github.com/sgenoud/replicad/tree/main/packages/replicad-app-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          on GitHub
        </a>
      </p>
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <label htmlFor="thicknessInput">Wall</label>
          <input
            id="thicknessInput"
            type="number"
            step="1"
            min="1"
            max="10"
            value={size}
            onChange={(v) => {
              const val = parseInt(v.target.value);
              if (val > 0 && val <= 10) setSize(val);
            }}
          />
        </div>
        <button onClick={downloadModel}>Download STEP</button>
      </section>
      <section style={{ height: "300px", width: "300px" }}>
        {mesh ? (
          <ThreeContext>
            <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
          </ThreeContext>
        ) : (
          <div
            style={{ display: "flex", alignItems: "center", fontSize: "2em" }}
          >
            Loading...
          </div>
        )}
      </section>
    </main>
  );
}
