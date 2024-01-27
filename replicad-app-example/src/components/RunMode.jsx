import React, { useEffect, useState, useRef } from "react";
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import GlobalVariables from "./js/globalvariables.js";
import globalvariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

import ToggleRunCreate from "./ToggleRunCreate.jsx";
import ParamsEditor from "./ParameterEditor.jsx";
import RunNavigation from "./RunNavigation.jsx";
import Molecule from "./molecules/molecule.js";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useParams,
  useNavigate,
} from "react-router-dom";

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

function runMode(props) {
  // canvas to hide
  const canvasRef = useRef(500);

  //Todo this is not very clean
  let cad = props.displayProps.cad;
  let size = props.displayProps.size;
  let setMesh = props.displayProps.setMesh;
  let mesh = props.displayProps.mesh;

  const [gridParamRun, setGridRun] = useState(true);
  const [axesParamRun, setAxesRun] = useState(true);
  const [isItOwned, setOwned] = useState(false);

  var authorizedUserOcto = props.props.authorizedUserOcto;
  var setActiveAtom = props.props.setActiveAtom;
  var activeAtom = props.props.activeAtom;
  var tryLogin = props.props.tryLogin;

  const windowSize = useWindowSize();

  var navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    GlobalVariables.canvas = canvasRef;
    console.log(canvasRef);
    GlobalVariables.c = canvasRef.current.getContext("2d");

    var octokit = new Octokit();
    octokit.request("GET /repositories/:id", { id }).then((result) => {
      globalvariables.currentRepo = result.data;
      /** Only run loadproject() if the project is different from what is already loaded  */
      if (globalvariables.currentRepo !== GlobalVariables.loadedRepo) {
        //Load a blank project
        GlobalVariables.topLevelMolecule = new Molecule({
          x: 0,
          y: 0,
          topLevel: true,
          atomType: "Molecule",
        });
        GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;
        props.props.loadProject(GlobalVariables.currentRepo);
      }
    });

    if (
      GlobalVariables.currentRepo &&
      GlobalVariables.currentRepo.owner.login == globalvariables.currentUser
    ) {
      setOwned(true);
    }
  }, []);

  return (
    <>
      <canvas
        style={{ display: "none" }}
        ref={canvasRef}
        id="flow-canvas"
        tabIndex={0}
      ></canvas>
      <ToggleRunCreate
        run={true}
        authorizedUserOcto={authorizedUserOcto}
        isItOwned={isItOwned}
      />
      {activeAtom ? (
        <ParamsEditor
          run={true}
          setActiveAtom={setActiveAtom}
          activeAtom={activeAtom}
          setGrid={setGridRun}
          setAxes={setAxesRun}
        />
      ) : null}
      <RunNavigation
        authorizedUserOcto={authorizedUserOcto}
        tryLogin={tryLogin}
      />
      <div className="info_run_div">
        <p>{"Project Name: " + globalvariables.currentRepo.name}</p>
        <p>{"Repo Owner: " + globalvariables.currentRepo.owner.login}</p>
      </div>
      <div className="runContainer">
        <div
          className="jscad-container"
          style={{
            width: windowSize.width,
            height: windowSize.height,
          }}
        >
          <section
            id="threeDView"
            style={{
              // width: windowSize.width*.6,
              height: windowSize.height,
            }}
          >
            {mesh ? (
              <ThreeContext gridParam={gridParamRun} axesParam={axesParamRun}>
                <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
              </ThreeContext>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1em",
                }}
              >
                Loading...
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default runMode;
