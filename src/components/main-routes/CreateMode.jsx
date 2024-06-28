import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import ToggleRunCreate from "../secondary/ToggleRunCreate.jsx";
import TopMenu from "../secondary/TopMenu.jsx";
import FlowCanvas from "./flowCanvas.jsx";
import LowerHalf from "./lowerHalf.jsx";
import ParamsEditor from "../secondary/ParameterEditor.jsx";
import CodeWindow from "../secondary/codeWindow.jsx";
import {
  BrowserRouter as Router,
  useParams,
  useNavigate,
} from "react-router-dom";
import NewProjectPopUp from "../secondary/NewProjectPopUp.jsx";
import { re } from "mathjs";

/**
 * Create mode component appears displays flow canvas, renderer and sidebar when
 * a user has been authorized access to a project.
 * @prop {object} authorizedUserOcto - authorized octokit instance
 * @prop {setstate} setRunMode - setState function for runMode
 * @prop {boolean} RunMode - Determines if Run mode is on or off
 */
function CreateMode(props) {
  const navigate = useNavigate();

  let authorizedUserOcto = props.props.authorizedUserOcto;
  let activeAtom = props.props.activeAtom;
  let setActiveAtom = props.props.setActiveAtom;

  // new project form pop up state
  const exportPopUp = props.props.exportPopUp;
  const setExportPopUp = props.props.setExportPopUp;

  /** State for grid and axes parameters */
  const [gridParam, setGrid] = useState(true);
  const [axesParam, setAxes] = useState(true);
  const [wireParam, setWire] = useState(true);
  const [solidParam, setSolid] = useState(true);

  /** State for save progress bar */
  const [saveState, setSaveState] = useState(0);
  const [savePopUp, setSavePopUp] = useState(false);
  const [commitState, setCommitState] = useState(0);

  /** State for top level molecule */
  const [currentMoleculeTop, setTop] = useState(false);

  /**
   * Object containing letters and values used for keyboard shortcuts
   * @type {object?}
   */
  var shortCuts = {
    a: "Assembly",
    b: "Loft", //>
    c: "Copy",
    d: "Difference",
    e: "Extrude",
    g: "GitHub", // Not working yet
    i: "Input",
    j: "Translate",
    r: "Rotate",
    u: "Rectangle",
    l: "Circle",
    m: "Molecule",
    s: "Save",
    v: "Paste",
    x: "Equation",
    y: "Code", //is there a more natural code letter? can't seem to prevent command t new tab behavior
    z: "Undo", //saving this letter
  };

  /** Checks if activeAtom is topLevel to render goUp button */
  useEffect(() => {
    if (activeAtom && activeAtom.atomType == "Molecule") {
      setTop(!activeAtom.topLevel);
    }
  }, [activeAtom]);

  useEffect(() => {
    window.addEventListener("keydown", handleBodyClick);
    return () => {
      window.removeEventListener("keydown", handleBodyClick);
    };
  });

  useEffect(() => {
    //Set autosave interval
    const myInterval = setInterval(() => {
      setSavePopUp(true);
      saveProject(setSaveState);
    }, 120000);

    //Clearing the interval
    return () => clearInterval(myInterval);
  }, []);

  const handleBodyClick = (e) => {
    if (e.metaKey && e.key == "s") {
      e.preventDefault();
      setSavePopUp(true);
      saveProject(setSaveState);
    }
  };

  /** Display props for replicad renderer  */
  let cad = props.displayProps.cad;
  let setMesh = props.displayProps.setMesh;
  let mesh = props.displayProps.mesh;
  let setWireMesh = props.displayProps.setWireMesh;
  let wireMesh = props.displayProps.wireMesh;
  /**
   * Create a commit as part of the saving process.
   */
  const createCommit = async function (
    octokit,
    { owner, repo, base, changes },
    setState
  ) {
    setState(20);
    if (!base) {
      octokit
        .request("GET /repos/{owner}/{repo}", {
          owner: owner,
          repo: repo,
        })
        .then((response) => {
          setState(30);
          base = response.data.default_branch;
          octokit.rest.repos
            .listCommits({
              owner,
              repo,
              sha: base,
              per_page: 1,
            })
            .then((response) => {
              setState(40);
              let latestCommitSha = response.data[0].sha;
              const treeSha = response.data[0].commit.tree.sha;
              octokit.rest.git
                .createTree({
                  owner,
                  repo,
                  base_tree: treeSha,
                  tree: Object.keys(changes.files).map((path) => {
                    if (changes.files[path] != null) {
                      return {
                        path,
                        mode: "100644",
                        content: changes.files[path],
                      };
                    } else {
                      return {
                        path,
                        mode: "100644",
                        sha: null,
                      };
                    }
                  }),
                })
                .then((response) => {
                  setState(60);
                  const newTreeSha = response.data.sha;

                  octokit.rest.git
                    .createCommit({
                      owner,
                      repo,
                      message: changes.commit,
                      tree: newTreeSha,
                      parents: [latestCommitSha],
                    })
                    .then((response) => {
                      setState(80);
                      latestCommitSha = response.data.sha;
                      octokit.rest.git
                        .updateRef({
                          owner,
                          repo,
                          sha: latestCommitSha,
                          ref: "heads/" + base,
                          force: true,
                        })
                        .then((response) => {
                          setState(90);
                          console.warn("Project saved");
                          setState(100);
                        });
                    });
                });
            });
        });
    }
  };

  const uploadAFile = async function (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      let base64result = e.target.result.split(",")[1];
      authorizedUserOcto.rest.repos
        .createOrUpdateFileContents({
          owner: GlobalVariables.currentUser,
          repo: GlobalVariables.currentRepoName,
          path: file.name,
          message: "Import File",
          content: base64result,
        })
        .then((result) => {
          activeAtom.updateFile(file, result.data.content.sha);
          saveProject(setSaveState);
        });
    };
    reader.readAsDataURL(file);
  };

  const deleteAFile = async function (fileName, fileSha) {
    console.log("deleting file");
    authorizedUserOcto.rest.repos.deleteFile({
      owner: GlobalVariables.currentUser,
      repo: GlobalVariables.currentRepoName,
      path: fileName,
      message: "Deleted node",
      sha: fileSha,
    });
  };

  /**
   * Saves project by making a commit to the Github repository.
   */
  const saveProject = async (setState) => {
    setState(5);
    let finalSVG;

    finalSVG = await GlobalVariables.topLevelMolecule
      .generateProjectThumbnail()
      .catch((error) => {
        console.error("Error generating project thumbnail: ", error);
      });

    var jsonRepOfProject = GlobalVariables.topLevelMolecule.serialize();
    jsonRepOfProject.filetypeVersion = 1;
    const projectContent = JSON.stringify(jsonRepOfProject, null, 4);
    // format and compile the BOM
    var bomHeader =
      "###### Note: Do not edit this file directly, it is automatically generated from the CAD model \n# Bill Of Materials \n |Part|Number Needed|Price|Source| \n |----|----------|-----|-----|";

    var bomContent = bomHeader;
    var bomItems = GlobalVariables.topLevelMolecule.compiledBom;
    var totalParts = 0;
    var totalCost = 0;
    if (bomItems != undefined) {
      bomItems.forEach((item) => {
        totalParts += item.numberNeeded;
        totalCost += item.costUSD;
        bomContent =
          bomContent +
          "\n|" +
          item.BOMitemName +
          "|" +
          item.numberNeeded +
          "|$" +
          item.costUSD.toFixed(2) +
          "|" +
          // convertLinks(item.source) +
          "|";
      });
    }
    bomContent =
      bomContent +
      "\n|" +
      "Total: " +
      "|" +
      totalParts +
      "|$" +
      totalCost.toFixed(2) +
      "|" +
      " " +
      "|";
    bomContent = bomContent + "\n\n 3xCOG MSRP: $" + (3 * totalCost).toFixed(2);

    var readmeHeader =
      "###### Note: Do not edit this file directly, it is automatically generated from the CAD model";

    var readmeContent =
      readmeHeader +
      "\n\n" +
      "# " +
      GlobalVariables.currentRepoName +
      "\n\n![](/project.svg)\n\n";

    let readMeRequestResult =
      await GlobalVariables.topLevelMolecule.requestReadme();
    readmeContent = readmeContent + readMeRequestResult.readMeText + "\n\n";

    /** File object to commit */
    let filesObject = {
      "BillOfMaterials.md": bomContent,
      "README.md": readmeContent,
      "project.svg": finalSVG ? finalSVG : "",
      "project.abundance": projectContent,
    };

    let readmeSVGs = readMeRequestResult.svgs;

    if (readmeSVGs) {
      readmeSVGs.forEach((item) => {
        filesObject["readme" + item.uniqueID + ".svg"] = item.svg;
      });
    }

    setState(10);

    createCommit(
      authorizedUserOcto,
      {
        owner: GlobalVariables.currentUser,
        repo: GlobalVariables.currentRepo.name,
        changes: {
          files: filesObject,
          commit: "Autosave",
        },
      },
      setState
    );
  };

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
          {exportPopUp ? (
            <NewProjectPopUp
              setExportPopUp={setExportPopUp}
              exporting={true}
              authorizedUserOcto={authorizedUserOcto}
            />
          ) : null}
          <ToggleRunCreate run={false} />
          <button
            className="round-button"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              position: "absolute",
              top: "44%",
              right: "1%",
              opacity: "0.5",
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => {
              console.log(
                Object.entries(shortCuts)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")
              );
            }}
          ></button>
          <TopMenu
            authorizedUserOcto={authorizedUserOcto}
            savePopUp={savePopUp}
            setSavePopUp={setSavePopUp}
            saveProject={saveProject}
            setExportPopUp={setExportPopUp}
            saveState={saveState}
            setSaveState={setSaveState}
            currentMoleculeTop={currentMoleculeTop}
            setActiveAtom={setActiveAtom}
          />
          <CodeWindow activeAtom={activeAtom} />
          <input
            type="file"
            id="fileLoaderInput"
            style={{ display: "none" }}
            onChange={(value) => {
              let file = value.target.files[0];
              uploadAFile(file);
            }}
          />
          <input
            type="button"
            id="fileDeleteInput"
            style={{ display: "none" }}
            onClick={() => {
              deleteAFile(activeAtom.fileName, activeAtom.sha);
            }}
          />
          <FlowCanvas
            props={{
              activeAtom: activeAtom,
              loadProject: props.props.loadProject,
              setActiveAtom: setActiveAtom,
              setSavePopUp: setSavePopUp,
              setSaveState: setSaveState,
              setTop: setTop,
              shortCuts: shortCuts,
            }}
            displayProps={{
              setMesh: setMesh,
              cad: cad,
              setWireMesh: setWireMesh,
            }}
          />
          <div className="parent flex-parent" id="lowerHalf">
            {activeAtom ? (
              <ParamsEditor
                activeAtom={activeAtom}
                setActiveAtom={setActiveAtom}
                setGrid={setGrid}
                setAxes={setAxes}
                setWire={setWire}
                setSolid={setSolid}
              />
            ) : null}

            <LowerHalf
              props={{
                gridParam: gridParam,
                axesParam: axesParam,
                wireParam: wireParam,
                solidParam: solidParam,
                setSaveState: setSaveState,
                setSaveState: setSaveState,
              }}
              displayProps={{
                mesh: mesh,
                wireMesh: wireMesh,
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
      //auto login - turned off for development
      /*props.props
        .tryLogin()
        .then((result) => {
          navigate(`/${GlobalVariables.currentRepo.id}`);
        })
        .catch((error) => {
          navigate(`/run/${GlobalVariables.currentRepo.id}`);
        });*/
    });

    //tryLogin();
  }
}

export default CreateMode;
