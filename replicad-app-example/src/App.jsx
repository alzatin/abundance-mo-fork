import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import FileSaver from "file-saver";
import { wrap } from "comlink";

// import ThreeContext from "./components/ThreeContext.jsx";
// import ReplicadMesh from "./components/ReplicadMesh.jsx";
import GlobalVariables from "./components/js/globalvariables.js";

import LoginMode from "./components/LoginMode.jsx";

import RunMode from "./components/RunMode.jsx";
import CreateMode from "./components/CreateMode.jsx";

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

  const [mesh, setMesh] = useState({});
  const [wireMesh, setWireMesh] = useState(null);

  useEffect(() => {
    cad.createMesh(size).then((m) => setMesh(m));
    cad.createMesh(size).then((m) => setWireMesh(m));
  }, [size]);

  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [activeAtom, setActiveAtom] = useState(null);
  const [exportPopUp, setExportPopUp] = useState(false);

  /**
   * Tries initial log in and saves octokit in authorizedUserOcto.
   */
  const tryLogin = function () {
    return new Promise((resolve, reject) => {
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
            resolve(authorizedUserOcto);
          }
        });
      });
    });
  };

  // Loads project
  const loadProject = function (project) {
    GlobalVariables.loadedRepo = project;
    GlobalVariables.currentRepoName = project.name;
    GlobalVariables.currentRepo = project;
    GlobalVariables.totalAtomCount = 0;
    GlobalVariables.numberOfAtomsToLoad = 0;
    GlobalVariables.startTime = new Date().getTime();

    var octokit = new Octokit();

    octokit
      .request("GET /repos/{owner}/{repo}/contents/project.maslowcreate", {
        owner: project.owner.login,
        repo: project.name,
      })
      .then((response) => {
        //content will be base64 encoded
        let rawFile = JSON.parse(atob(response.data.content));

        if (rawFile.filetypeVersion == 1) {
          GlobalVariables.topLevelMolecule.deserialize(rawFile);
        } else {
          GlobalVariables.topLevelMolecule.deserialize(
            convertFromOldFormat(rawFile)
          );
        }
        setActiveAtom(GlobalVariables.currentMolecule);
      });
  };

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
                authorizedUserOcto={authorizedUserOcto}
                tryLogin={tryLogin}
                setIsLoggedIn={setIsLoggedIn}
                isloggedIn={isloggedIn}
                exportPopUp={exportPopUp}
                setExportPopUp={setExportPopUp}
              />
            }
          />
          <Route
            path="/:id"
            element={
              <CreateMode
                props={{
                  activeAtom: activeAtom,
                  setActiveAtom: setActiveAtom,
                  authorizedUserOcto: authorizedUserOcto,
                  tryLogin: tryLogin,
                  loadProject: loadProject,
                  exportPopUp: exportPopUp,
                  setExportPopUp: setExportPopUp,
                }}
                displayProps={{
                  mesh: mesh,
                  setMesh: setMesh,
                  size: size,
                  cad: cad,
                  wireMesh: wireMesh,
                  setWireMesh: setWireMesh,
                }}
              />
            }
          />
          <Route
            path="/run/:id"
            element={
              <RunMode
                props={{
                  isloggedIn: isloggedIn,
                  setActiveAtom: setActiveAtom,
                  activeAtom: activeAtom,
                  authorizedUserOcto: authorizedUserOcto,
                  tryLogin: tryLogin,
                  loadProject: loadProject,
                }}
                displayProps={{
                  mesh: mesh,
                  setMesh: setMesh,
                  size: size,
                  cad: cad,
                  wireMesh: wireMesh,
                  setWireMesh: setWireMesh,
                }}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
