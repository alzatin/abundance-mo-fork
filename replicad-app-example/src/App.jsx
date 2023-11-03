import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

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
        <TopMenu
          setPopUpOpen={setPopUpOpen}
          authorizedUserOcto={authorizedUserOcto}
          setIsLoggedIn={setIsLoggedIn}
        />
        <div id="headerBar">
          <p> Maslow Create</p>
          <img
            className="thumnail-logo"
            src="/imgs/maslow-logo.png"
            alt="logo"
          />
          {popUpOpen ? (
            <LoginPopUp
              tryLogin={tryLogin}
              setIsLoggedIn={setIsLoggedIn}
              isloggedIn={isloggedIn}
              setPopUpOpen={setPopUpOpen}
              setRunMode={setRunMode}
            />
          ) : null}
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

  return (
    <main>
      {runModeon ? (
        <RunMode
          props={{ authorizedUserOcto: authorizedUserOcto }}
          displayProps={{ mesh: mesh, setMesh: setMesh, size: size, cad: cad }}
        />
      ) : (
        <CreateMode />
      )}
    </main>
  );
}
