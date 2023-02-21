import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import FileSaver from "file-saver";
import { wrap } from "comlink";

import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import TodoList from "./TodoList.jsx";
import FlowCanvas from './components/flowCanvas.jsx'

import cadWorker from "./worker.js?worker";

import './maslowCreate.css';
import './menuIcons.css';
import './login.css';
import './codemirror.css';

const cad = wrap(new cadWorker());

const LOCAL_STORAGE_KEY = 'todoApp.todos';

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
      <FlowCanvas/>
      <div class='parent flex-parent' id = "lowerHalf">     
        <div class="jscad-container"> 
          <section>
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
              <div id="arrow-up-menu" class="arrow-up"></div>
              <div id="viewer_bar"></div>
            
          </div>
          <div class="sideBar">
              Maslow Create
          </div>
          <div id="bottom_bar"></div>
        </div>
      
    </main>
  );
}
