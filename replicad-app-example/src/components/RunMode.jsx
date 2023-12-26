import React, { useEffect, useState, useRef } from "react";
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import GlobalVariables from "./js/globalvariables.js";
import globalvariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import ShareDialog from "./ShareDialog.jsx";
import ToggleRunCreate from "./ToggleRunCreate.jsx";
import ParamsEditor from "./ParameterEditor.jsx";
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
  //Todo this is not very clean
  let cad = props.displayProps.cad;
  let size = props.displayProps.size;
  let setMesh = props.displayProps.setMesh;
  let mesh = props.displayProps.mesh;

  const [gridParamRun, setGridRun] = useState(true);
  const [axesParamRun, setAxesRun] = useState(true);

  var authorizedUserOcto = props.props.authorizedUserOcto;
  var setActiveAtom = props.props.setActiveAtom;
  var activeAtom = props.props.activeAtom;

  const windowSize = useWindowSize();

  var navigate = useNavigate();
  const { id } = useParams();

  // Loads project
  const loadRunProject = function (project) {
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
          setActiveAtom(GlobalVariables.topLevelMolecule);
        } else {
          GlobalVariables.topLevelMolecule.deserialize(
            convertFromOldFormat(rawFile)
          );
        }
      });
  };

  useEffect(() => {
    if (!globalvariables.currentRepo) {
      var octokit = new Octokit();
      octokit.request("GET /repositories/:id", { id }).then((result) => {
        globalvariables.currentRepo = result.data;
        /** Only run loadproject() if the project is different from what is already loaded  */
        if (globalvariables.currentRepo !== GlobalVariables.loadedRepo) {
          console.log("new repo is being loaded");
          //Load a blank project
          GlobalVariables.topLevelMolecule = new Molecule({
            x: 0,
            y: 0,
            topLevel: true,
            atomType: "Molecule",
          });
          GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;
          loadRunProject(GlobalVariables.currentRepo);
        }
      });
    }
  }, []);

  /** forkProject takes care of making the octokit request for the authenticated user to make a copy of a not owned repo */
  const forkProject = async function () {
    if (props.props.authorizedUserOcto) {
      var owner = GlobalVariables.currentRepo.owner.login;
      var repo = GlobalVariables.currentRepo.name;
      // if authenticated and it is not your project, make a clone of the project and return to create mode
      props.props.authorizedUserOcto
        .request("GET /repos/{owner}/{repo}", {
          owner: owner,
          repo: repo,
        })
        .then((result) => {
          props.props.authorizedUserOcto.rest.repos
            .createFork({
              owner: owner,
              repo: repo,
            })
            .then(() => {
              var activeUser = GlobalVariables.currentUser;
              // return to create mode
              props.props.authorizedUserOcto
                .request("GET /repos/{owner}/{repo}", {
                  owner: activeUser,
                  repo: repo,
                })
                .then((result) => {
                  props.props.setOwned(true);
                  GlobalVariables.currentRepo = result.data;
                  navigate(`/${GlobalVariables.currentRepo.id}`),
                    { replace: true };
                });
            });
        });
    } else {
      props.props.tryLogin().then((result) => {
        // is this an infinite loop? or if it's not authenticated does it end and that's that?
        forkProject();
      });
    }
  };

  /**
   * Like a project on github by unique ID.
   */
  const starProject = function (id) {
    //Find out the information of who owns the project we are trying to like

    var owner = GlobalVariables.currentRepo.owner.login;
    var repoName = GlobalVariables.currentRepo.name;
    document.getElementById("Star-button").style.backgroundColor = "gray";

    authorizedUserOcto.rest.activity.starRepoForAuthenticatedUser({
      owner: owner,
      repo: repoName,
    });
    //Find out if the project has been starred and unstar if it is
    /* octokit.activity.checkStarringRepo({
                    owner:user,
                    repo: repoName
                }).then(() => { 
                    var button= document.getElementById("Star-button")
                    button.setAttribute("class","browseButton")
                    button.innerHTML = "Star"
                    octokit.activity.unstarRepo({
                        owner: user,
                        repo: repoName
                    })
                })*/
  };

  return (
    <>
      <ShareDialog />
      {props.props.isloggedIn ? <ToggleRunCreate run={true} /> : null}
      {activeAtom ? (
        <ParamsEditor
          run={true}
          setActiveAtom={setActiveAtom}
          activeAtom={activeAtom}
          setGrid={setGridRun}
          setAxes={setAxesRun}
        />
      ) : null}

      <div className="runContainer">
        {/*<div className="runSideBar">
          <p className="molecule_title">{globalvariables.currentRepoName}</p>
          <p className="atom_description">Description</p>
          <div className="runSideBarDiv">
            <div className="sidebar-subitem">
              <button className=" browseButton" id="BillOfMaterials-button">
                Bill Of Materials
              </button>
              {props.props.authorizedUserOcto ? (
                <button
                  className=" browseButton"
                  id="Fork-button"
                  onClick={forkProject}
                >
                  Fork
                </button>
              ) : null}

              <button
                className=" browseButton"
                id="Share-button"
                onClick={() => {
                  var shareDialog = document.querySelector("dialog");
                  shareDialog.showModal();
                }}
              >
                Share
              </button>
              <button
                className=" browseButton"
                id="Star-button"
                onClick={() => {
                  starProject(GlobalVariables.currentRepo.id);
                }}
              >
                Star
              </button>
            </div>
            <Link to={`/`}>
              <button>Return to browsing</button>
            </Link>
          </div>
        </div> */}
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
