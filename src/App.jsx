import React, { useState, useEffect } from "react";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import {
  BrowserRouter,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { wrap } from "comlink";
import GlobalVariables from "./js/globalvariables.js";
import LoginMode from "./components/main-routes/LoginMode.jsx";
import RunMode from "./components/main-routes/RunMode.jsx";
import CreateMode from "./components/main-routes/CreateMode.jsx";
import cadWorker from "./worker.js?worker";
import { BOMEntry } from "./js/BOM.js";
import { button } from "leva";

/*Import style scripts*/
import "./styles/maslowCreate.css";
import "./styles//menuIcons.css";
import "./styles//login.css";
import "./styles//codemirror.css";
/**
 * The octokit instance which allows authenticated interaction with GitHub.
 * @type {object}
 */
var authorizedUserOcto = null;

const cad = wrap(new cadWorker());

export default function ReplicadApp() {
  const [size, setSize] = useState(5);
  const [mesh, setMesh] = useState({});
  const [wireMesh, setWireMesh] = useState(null);

  useEffect(() => {
    cad.createMesh(size).then((m) => setMesh(m));
    cad.createMesh(size).then((m) => setWireMesh(m));
  }, [size]);

  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [activeAtom, setActiveAtom] = useState(null);
  const [exportPopUp, setExportPopUp] = useState(false);

  const [compiledBom, setCompiledBom] = useState({});

  useEffect(() => {
    GlobalVariables.writeToDisplay = (id, resetView = false) => {
      console.log("write to display running " + id);

      cad.generateDisplayMesh(id).then((m) => {
        setMesh(m);
      });
      // if something is connected to the output, set a wireframe mesh
      if (typeof GlobalVariables.currentMolecule.output.value == "number") {
        cad
          .generateDisplayMesh(GlobalVariables.currentMolecule.output.value)
          .then((w) => setWireMesh(w));
      } else {
        console.warn("no wire to display");
      }
    };

    GlobalVariables.cad = cad;
  });

  /** Compile BOM when activeAtom is a molecule and sets new state to trigger menu rerender */
  /** Should this be in flowcanvas so that it runs after project is loaded? */
  useEffect(() => {
    if (GlobalVariables.currentMolecule != undefined && activeAtom) {
      if (activeAtom.atomType == "Molecule") {
        compileBom().then((result) => {
          let bomParams = {};
          if (result != undefined) {
            result.map((item) => {
              bomParams[item.BOMitemName] = {
                value: item.costUSD + " USD",
                label: item.BOMitemName + "(x" + item.numberNeeded + ")",
                disabled: true,
              };
            });
            bomParams["Download List of Materials"] = button(() =>
              console.log(result)
            );

            setCompiledBom(bomParams);
          }
        });
      }
    }
  }, [activeAtom]);

  const compileBom = async () => {
    if (GlobalVariables.currentMolecule.output.value) {
      let compiled = GlobalVariables.currentMolecule
        .extractBomTags(GlobalVariables.currentMolecule.output.value)
        .then((result) => {
          let bomList = [];
          let compileBomItems = [];
          if (result) {
            result.forEach(function (bomElement) {
              if (!bomList[bomElement.BOMitemName]) {
                //If the list of items doesn't already have one of these
                bomList[bomElement.BOMitemName] = new BOMEntry(); //Create one
                bomList[bomElement.BOMitemName].numberNeeded = 0; //Set the number needed to zerio initially
                bomList[bomElement.BOMitemName].BOMitemName =
                  bomElement.BOMitemName; //With the information from the item
                bomList[bomElement.BOMitemName].source = bomElement.source;
                compileBomItems.push(bomList[bomElement.BOMitemName]);
              }
              bomList[bomElement.BOMitemName].numberNeeded +=
                bomElement.numberNeeded;
              bomList[bomElement.BOMitemName].costUSD += bomElement.costUSD;
            });

            // Alphabetize by source
            compileBomItems = compileBomItems.sort((a, b) =>
              a.source > b.source ? 1 : b.source > a.source ? -1 : 0
            );
            return compileBomItems;
          }
        });
      return compiled;
    }
  };
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
      .request("GET /repos/{owner}/{repo}/contents/project.abundance", {
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
        GlobalVariables.currentMolecule.selected = true;
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
                  compileBomb: compileBom,
                  compiledBom: compiledBom,
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
                  activeAtom: GlobalVariables.currentMolecule,
                  authorizedUserOcto: authorizedUserOcto,
                  tryLogin: tryLogin,
                  loadProject: loadProject,
                  compiledBom: compiledBom,
                }}
                displayProps={{
                  mesh: mesh,
                  wireMesh: wireMesh,
                }}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
