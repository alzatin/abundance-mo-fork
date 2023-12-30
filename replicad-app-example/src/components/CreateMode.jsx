import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import ToggleRunCreate from "./ToggleRunCreate.jsx";
import TopMenu from "./TopMenu.jsx";
import FlowCanvas from "./flowCanvas.jsx";
import LowerHalf from "./lowerHalf.jsx";
import ParamsEditor from "./ParameterEditor.jsx";

import {
  BrowserRouter as Router,
  useParams,
  useNavigate,
} from "react-router-dom";

/**
 * Create mode component appears displays flow canvas, renderer and sidebar when
 * a user has been authorized access to a project.
 * @prop {object} authorizedUserOcto - authorized octokit instance
 * @prop {setstate} setRunMode - setState function for runMode
 * @prop {boolean} RunMode - Determines if Run mode is on or off
 */
function CreateMode(props) {
  const navigate = useNavigate();

  const [gridParam, setGrid] = useState(true);
  const [axesParam, setAxes] = useState(true);

  let authorizedUserOcto = props.props.authorizedUserOcto;
  let activeAtom = props.props.activeAtom;
  let setActiveAtom = props.props.setActiveAtom;

  /** Display props for replicad renderer  */
  let cad = props.displayProps.cad;
  let size = props.displayProps.size;
  let setMesh = props.displayProps.setMesh;
  let mesh = props.displayProps.mesh;

  if (authorizedUserOcto) {
    if (
      GlobalVariables.currentRepo.owner.login ==
      GlobalVariables.currentRepo.owner.login
    ) {
      return (
        <>
          <div id="headerBar">
            <img
              className="thumnail-logo"
              src="/imgs/maslow-logo.png"
              alt="logo"
            />
          </div>
          <ToggleRunCreate run={false} />
          <TopMenu authorizedUserOcto={authorizedUserOcto} />
          <FlowCanvas
            props={{ setActiveAtom: setActiveAtom }}
            displayProps={{
              mesh: mesh,
              setMesh: setMesh,
              size: size,
              cad: cad,
            }}
          />
          <div className="parent flex-parent" id="lowerHalf">
            {activeAtom ? (
              <ParamsEditor
                activeAtom={activeAtom}
                setActiveAtom={setActiveAtom}
                setGrid={setGrid}
                setAxes={setAxes}
              />
            ) : null}

            <LowerHalf
              props={{ gridParam: gridParam, axesParam: axesParam }}
              displayProps={{
                mesh: mesh,
                setMesh: setMesh,
                size: size,
                cad: cad,
              }}
            />
          </div>
        </>
      );
    } else {
      navigate(`/run/${GlobalVariables.currentRepo.id}`);
    }
  } else {
    /** get repository from github by the id in the url */

    console.warn("You are not logged in");
    const { id } = useParams();
    var octokit = new Octokit();
    octokit.request("GET /repositories/:id", { id }).then((result) => {
      GlobalVariables.currentRepoName = result.data.name;
      GlobalVariables.currentRepo = result.data;
      props.props
        .tryLogin()
        .then((result) => {
          navigate(`/${GlobalVariables.currentRepo.id}`);
        })
        .catch((error) => {
          navigate(`/run/${GlobalVariables.currentRepo.id}`);
        });
    });

    //tryLogin();
  }
}

export default CreateMode;
