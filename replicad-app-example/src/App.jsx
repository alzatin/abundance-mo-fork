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
    /**
     * Export a molecule as a new github project.
     */ // adding this function here because I'm not sure where it's supposed to go
    const exportCurrentMoleculeToGithub = function (molecule) {
      //Get name and description
      var name = molecule.name;
      var description = "A stand alone molecule exported from Maslow Create";

      //Create a new repo
      octokit.repos
        .createForAuthenticatedUser({
          name: name,
          description: description,
        })
        .then((result) => {
          //Once we have created the new repo we need to create a file within it to store the project in
          var repoName = result.data.name;
          var id = result.data.id;
          var path = "project.maslowcreate";
          var content = window.btoa("init"); // create a file with just the word "init" in it and base64 encode it
          octokit.repos
            .createOrUpdateFileContents({
              owner: currentUser,
              repo: repoName,
              path: path,
              message: "initialize repo",
              content: content,
            })
            .then(() => {
              //Save the molecule into the newly created repo

              var path = "project.maslowcreate";

              molecule.topLevel = true; //force the molecule to export in the long form as if it were the top level molecule
              var content = window.btoa(
                JSON.stringify(molecule.serialize({ molecules: [] }), null, 4)
              ); //Convert the passed molecule object to a JSON string and then convert it to base64 encoding

              //Get the SHA for the file
              octokit.repos
                .getContent({
                  owner: currentUser,
                  repo: repoName,
                  path: path,
                })
                .then((result) => {
                  var sha = result.data.sha;

                  //Save the repo to the file
                  octokit.repos
                    .updateFile({
                      owner: currentUser,
                      repo: repoName,
                      path: path,
                      message: "export Molecule",
                      content: content,
                      sha: sha,
                    })
                    .then(() => {
                      //Replace the existing molecule now that we just exported
                      molecule.replaceThisMoleculeWithGithub(id);
                    });
                });
            });

          //Update the project topics
          octokit.repos.replaceTopics({
            owner: currentUser,
            repo: repoName,
            names: ["maslowcreate", "maslowcreate-molecule"],
            headers: {
              accept: "application/vnd.github.mercy-preview+json",
            },
          });
        });
    };

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
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
        <LowerHalf
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
