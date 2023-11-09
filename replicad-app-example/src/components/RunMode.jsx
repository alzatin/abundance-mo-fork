import React, { useEffect, useState, useRef } from "react";
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import GlobalVariables from "./js/globalvariables.js";
import globalvariables from "./js/globalvariables.js";
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
                  props.props.openForkedProject(result.data);
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
  var isItOwner = false;
  const windowSize = useWindowSize();
  // check if you own the project
  console.log(globalvariables.currentRepo);
  if (globalvariables.currentUser == globalvariables.currentRepo.owner.login) {
    isItOwner = true;
  }

  return (
    <>
      <div className="runContainer">
        <div className="runSideBar">
          <p className="molecule_title">{GlobalVariables.currentRepoName}</p>
          <p className="atom_description">Description</p>
          <div className="runSideBarDiv">
            <div className="sidebar-subitem">
              <button className=" browseButton" id="BillOfMaterials-button">
                Bill Of Materials
              </button>
              {!isItOwner ? (
                <button
                  className=" browseButton"
                  id="Fork-button"
                  onClick={forkProject}
                >
                  Fork
                </button>
              ) : null}

              <button className=" browseButton" id="Share-button">
                Share
              </button>
              <button className=" browseButton" id="Star-button">
                Star
              </button>
            </div>
          </div>
        </div>
        <div
          className="jscad-container"
          style={{
            width: windowSize.width * 0.6,
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
              <ThreeContext>
                <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
              </ThreeContext>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "2em",
                }}
              >
                Loading...
              </div>
            )}
          </section>
          <div id="arrow-up-menu" className="arrow-up"></div>
          <div id="viewer_bar"></div>
        </div>
      </div>
    </>
  );
}
export default runMode;
