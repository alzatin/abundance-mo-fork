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
} from "react-router-dom";

import FileSaver from "file-saver";
import { wrap } from "comlink";

// import ThreeContext from "./components/ThreeContext.jsx";
// import ReplicadMesh from "./components/ReplicadMesh.jsx";
import GlobalVariables from "./components/js/globalvariables.js";
import FlowCanvas from "./components/flowCanvas.jsx";
import LowerHalf from "./components/lowerHalf.jsx";
import LoginMode from "./components/LoginMode.jsx";
import TopMenu from "./components/TopMenu.jsx";
import RunMode from "./components/RunMode.jsx";
import ToggleRunCreate from "./components/ToggleRunCreate.jsx";

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

  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [isItOwned, setOwned] = useState(false);
  const [runModeon, setRunMode] = useState(false);
  const [activeAtom, setActiveAtom] = useState([]);

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

  function CreateMode() {
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
          props={{ activeAtom: activeAtom, setActiveAtom: setActiveAtom }}
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
        <LowerHalf
          props={{ activeAtom: activeAtom }}
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
      </>
    );
  }

  /* Toggle button to switch between run and create modes  */

  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <LoginMode
                setOwned={setOwned}
                authorizedUserOcto={authorizedUserOcto}
                tryLogin={tryLogin}
                setIsLoggedIn={setIsLoggedIn}
                isloggedIn={isloggedIn}
              />
            }
          />
          <Route path="/:id" element={<CreateMode />} />
          <Route
            path="/run/:id"
            element={
              <RunMode
                props={{
                  isItOwned: isItOwned,
                  setOwned: setOwned,
                  authorizedUserOcto: authorizedUserOcto,
                  tryLogin: tryLogin,
                  runModeon: runModeon,
                  setRunMode: setRunMode,
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
