import React, { useEffect, useState, useRef } from "react";
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";
import GlobalVariables from "./js/globalvariables.js";
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

function runMode(displayProps) {
  //Todo this is not very clean
  let cad = displayProps.displayProps.cad;
  let size = displayProps.displayProps.size;
  let setMesh = displayProps.displayProps.setMesh;
  let mesh = displayProps.displayProps.mesh;

  const windowSize = useWindowSize();
  return (
    <>
      <div class="runContainer">
        <div class="runSideBar">
          <p class="molecule_title">oof</p>
          <p class="atom_description">oof</p>
          <div class="runSideBarDiv">
            <div class="sidebar-subitem">
              <button class=" browseButton" id="BillOfMaterials-button">
                Bill Of Materials
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
