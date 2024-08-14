import React, { useEffect, useState, useRef } from "react";
import ThreeContext from "../render/ThreeContext.jsx";
import ReplicadMesh from "../render/ReplicadMesh.jsx";

import WireframeMesh from "../render/WireframeMesh.jsx";
import GlobalVariables from "../../js/globalvariables.js";
import globalvariables from "../../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

import ToggleRunCreate from "../secondary/ToggleRunCreate.jsx";
import ParamsEditor from "../secondary/ParameterEditor.jsx";
import RunNavigation from "../secondary/RunNavigation.jsx";
import Molecule from "../../molecules/molecule.js";
import {
  BrowserRouter as Router,
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

  let mesh = props.displayProps.mesh;
  let wireMesh = props.displayProps.wireMesh;

  const [gridParamRun, setGridRun] = useState(true);
  const [axesParamRun, setAxesRun] = useState(true);
  const [isItOwned, setOwned] = useState(false);
  const [wireParam, setWire] = useState(true);
  const [solidParam, setSolid] = useState(true);

  const authorizedUserOcto = props.props.authorizedUserOcto;
  const setActiveAtom = props.props.setActiveAtom;
  const activeAtom = props.props.activeAtom;
  const tryLogin = props.props.tryLogin;

  const windowSize = useWindowSize();

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    GlobalVariables.canvas = canvasRef;
    GlobalVariables.c = canvasRef.current.getContext("2d");

    var octokit = new Octokit();
    octokit.request("GET /repositories/:id", { id }).then((result) => {
      globalvariables.currentRepo = result.data;
      /*temp variables while we change to aws*/
      globalvariables.currentRepo.repoName = globalvariables.currentRepo.name;
      globalvariables.currentRepo.owner =
        globalvariables.currentRepo.owner.login;
      //make an aws call to get the project data before loading the project?
      /** Only run loadproject() if the project is different from what is already loaded  */
      if (
        !GlobalVariables.loadedRepo ||
        globalvariables.currentRepo.repoName !==
          GlobalVariables.loadedRepo.repoName
      ) {
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
          setWire={setWire}
          setSolid={setSolid}
        />
      ) : null}
      <RunNavigation
        authorizedUserOcto={authorizedUserOcto}
        tryLogin={tryLogin}
        activeAtom={activeAtom}
      />
      {globalvariables.currentRepo ? (
        <div className="info_run_div">
          <p>{"Project Name: " + globalvariables.currentRepo.repoName}</p>
          <p>{"Repo Owner: " + globalvariables.currentRepo.owner}</p>
        </div>
      ) : null}
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
            {wireMesh ? (
              <ThreeContext
                gridParam={gridParamRun}
                axesParam={axesParamRun}
                outdatedMesh={props.displayProps.outdatedMesh}
              >
                {wireParam ? <WireframeMesh mesh={wireMesh} /> : null}

                <ReplicadMesh
                  mesh={mesh}
                  isSolid={solidParam}
                  setOutdatedMesh={props.displayProps.setOutdatedMesh}
                />
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
