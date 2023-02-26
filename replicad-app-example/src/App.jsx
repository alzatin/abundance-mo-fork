import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import FileSaver from "file-saver";
import { wrap } from "comlink";

// import ThreeContext from "./components/ThreeContext.jsx";
// import ReplicadMesh from "./components/ReplicadMesh.jsx";
import TodoList from "./TodoList.jsx";
import FlowCanvas from './components/flowCanvas.jsx';
import LowerHalf from "./components/lowerHalf.jsx";

import cadWorker from "./worker.js?worker";

import './maslowCreate.css';
import './menuIcons.css';
import './login.css';
import './codemirror.css';

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
      <FlowCanvas displayProps ={{mesh: mesh, setMesh:setMesh, size:size, cad:cad}}/>
      <LowerHalf displayProps ={{mesh: mesh, setMesh:setMesh, size:size, cad:cad}}/>
    </main>
  );
}
