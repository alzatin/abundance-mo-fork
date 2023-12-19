import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import ToggleRunCreate from "./ToggleRunCreate.jsx";
import TopMenu from "./TopMenu.jsx";
import FlowCanvas from "./flowCanvas.jsx";
import LowerHalf from "./lowerHalf.jsx";
import SideBar from "./SideBar.jsx";
import {
  BrowserRouter as Router,
  useParams,
  useNavigate,
} from "react-router-dom";

function CreateMode(props) {
  const navigate = useNavigate();
  const [activeAtom, setActiveAtom] = useState([]);

  let authorizedUserOcto = props.props.authorizedUserOcto;
  let isloggedIn = props.props.isloggedIn;
  let setRunMode = props.props.setRunMode;
  let runModeon = props.props.runModeon;
  let cad = props.displayProps.cad;
  let size = props.displayProps.size;
  let setMesh = props.displayProps.setMesh;
  let mesh = props.displayProps.mesh;

  if (authorizedUserOcto) {
    return (
      <>
        <ToggleRunCreate runModeon={runModeon} setRunMode={setRunMode} />
        <TopMenu authorizedUserOcto={authorizedUserOcto} />
        <div id="headerBar">
          <img
            className="thumnail-logo"
            src="/imgs/maslow-logo.png"
            alt="logo"
          />
        </div>
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
          <LowerHalf
            displayProps={{
              mesh: mesh,
              setMesh: setMesh,
              size: size,
              cad: cad,
            }}
          />
          <SideBar activeAtom={activeAtom} />
        </div>
      </>
    );
  } else {
    /** get repository from github by the id in the url */

    console.warn("You are not logged in");
    const { id } = useParams();
    var octokit = new Octokit();
    octokit.request("GET /repositories/:id", { id }).then((result) => {
      GlobalVariables.currentRepoName = result.data.name;
      GlobalVariables.currentRepo = result.data;
      navigate(`/run/${GlobalVariables.currentRepo.id}`);
    });

    //open a pop up that gives you the option to log in or redirect to runmode

    //tryLogin();
  }
}

export default CreateMode;
