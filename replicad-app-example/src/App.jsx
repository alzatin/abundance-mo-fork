import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";

import FileSaver from "file-saver";
import { wrap } from "comlink";

// import ThreeContext from "./components/ThreeContext.jsx";
// import ReplicadMesh from "./components/ReplicadMesh.jsx";
import GlobalVariables from "./components/js/globalvariables.js";
import TodoList from "./TodoList.jsx";
import FlowCanvas from "./components/flowCanvas.jsx";
import LowerHalf from "./components/lowerHalf.jsx";
import LoginPopUp from "./components/LoginPopUp.jsx";
import TopMenu from "./components/TopMenu.jsx";
import RunMode from "./components/RunMode.jsx";

import cadWorker from "./worker.js?worker";

import "./maslowCreate.css";
import "./menuIcons.css";
import "./login.css";
import "./codemirror.css";
/**
 * The octokit instance which allows authenticated interaction with GitHub.
 * @type {object}
 */
var authorizedUserOcto = null;

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

  const [popUpOpen, setPopUpOpen] = useState(true);
  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [runModeon, setRunMode] = useState(false);
  const [isItOwned, setOwned] = useState(false);

  /**
   * Tries initial log in and saves octokit in authorizedUserOcto.
   */
  const tryLogin = function () {
    // Initialize with OAuth.io app public key
    if (window.location.href.includes("private")) {
      OAuth.initialize("6CQQE8MMCBFjdWEjevnTBMCQpsw"); //app public key for repo scope
    } else {
      OAuth.initialize("BYP9iFpD7aTV9SDhnalvhZ4fwD8"); //app public key for public_repo scope
    }

    // Use popup for oauth
    OAuth.popup("github").then((github) => {
      /**
       * Oktokit object to access github
       * @type {object}
       */
      authorizedUserOcto = new Octokit({
        auth: github.access_token,
      });
      //getting current user post authetication
      authorizedUserOcto.request("GET /user", {}).then((response) => {
        GlobalVariables.currentUser = response.data.login;
        if (GlobalVariables.currentUser) {
          setIsLoggedIn(true);
        }
      });
    });
  };

  function LoginInMode() {
    var location = useLocation();
    console.log(location.pathname);
    //use location? if run isn't part of URL THEN try login ?, if run is not part of URL show runmode but show login button
    var projectToLoad = GlobalVariables.currentRepo;
    return (
      <LoginPopUp
        setOwned={setOwned}
        projectToLoad={projectToLoad}
        tryLogin={tryLogin}
        setIsLoggedIn={setIsLoggedIn}
        isloggedIn={isloggedIn}
        setPopUpOpen={setPopUpOpen}
        setRunMode={setRunMode}
      />
    );
  }

  function CreateMode() {
    setRunMode(false);
    return (
      <>
        <TopMenu
          setPopUpOpen={setPopUpOpen}
          authorizedUserOcto={authorizedUserOcto}
          setIsLoggedIn={setIsLoggedIn}
        />
        <div id="headerBar">
          <img
            className="thumnail-logo"
            src="/imgs/maslow-logo.png"
            alt="logo"
          />
        </div>
        <FlowCanvas
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
        <LowerHalf
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
      </>
    );
  }

  /* Toggle button to switch between run and create modes  */
  const ToggleRunCreate = () => {
    const [runchecked, setChecked] = useState(false);
    const handleChange = () => {
      setChecked(!runchecked);
      setRunMode(!runModeon);
    };
    if (!runModeon) {
      return (
        <>
          <Link
            key={
              GlobalVariables.currentRepo
                ? GlobalVariables.currentRepo.id
                : null
            }
            to={
              GlobalVariables.currentRepo
                ? `/run/${GlobalVariables.currentRepo.id}`
                : "/run"
            }
            onClick={handleChange}
          >
            <label title="Create/Run Mode" className="switch">
              <input type="checkbox"></input>
              <span className="slider round"></span>
            </label>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link
            key={GlobalVariables.currentRepo.id}
            to={`/${GlobalVariables.currentRepo.id}`}
            onClick={handleChange}
          >
            <label title="Create/Run Mode" className="switch">
              <input type="checkbox" defaultChecked></input>
              <span className="slider round"></span>
            </label>
          </Link>
        </>
      );
    }
  };

  return (
    <main>
      <BrowserRouter>
        {popUpOpen ? <LoginInMode /> : null}
        {isItOwned ? <ToggleRunCreate /> : null}
        <Routes>
          <Route exact path="/" element={<CreateMode />} />
          <Route path="/:id" element={<CreateMode />} />
          <Route
            path="/run/:id"
            element={
              <RunMode
                props={{
                  setPopUpOpen: setPopUpOpen,
                  isItOwned: isItOwned,
                  setRunMode: setRunMode,
                  setOwned: setOwned,
                  authorizedUserOcto: authorizedUserOcto,
                  tryLogin: tryLogin,
                }}
                displayProps={{
                  mesh: mesh,
                  setMesh: setMesh,
                  size: size,
                  cad: cad,
                }}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
