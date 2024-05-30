import React, { memo, useEffect, useState } from "react";
import ThreeContext from "../render/ThreeContext.jsx";
import ReplicadMesh from "../render/ReplicadMesh.jsx";
import WireframeMesh from "../render/WireframeMesh.jsx";

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
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

export default memo(function LowerHalf(props) {
  let mesh = props.displayProps.mesh;
  let wireMesh = props.displayProps.wireMesh;

  const windowSize = useWindowSize();

  return (
    <>
      <div
        className="jscad-container"
        style={{
          width: windowSize.width * 1,
          height: windowSize.height * 0.6,
        }}
      >
        <section
          id="threeDView"
          style={{
            width: windowSize.width * 1,
            height: windowSize.height * 0.6,
          }}
        >
          {wireMesh ? (
            <ThreeContext
              gridParam={props.props.gridParam}
              axesParam={props.props.axesParam}
            >
              {props.props.wireParam ? <WireframeMesh mesh={wireMesh} /> : null}
              <ReplicadMesh mesh={mesh} isSolid={props.props.solidParam} />
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
        <div className="container arrow-up">
          <input type="checkbox" className="custom" />
          <div className="dots"></div>
        </div>
        <div id="viewer_bar"></div>
      </div>

      <div id="bottom_bar"></div>
    </>
  );
});
