import React, {useEffect, useState } from 'react';
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";

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

export default function LowerHalf(displayProps) {

    //Todo this is not very clean
    let cad = displayProps.displayProps.cad;
    let size = displayProps.displayProps.size;
    let setMesh = displayProps.displayProps.setMesh;
    let mesh = displayProps.displayProps.mesh;

    const windowSize = useWindowSize();
    
    return (
        <>
            <div className='parent flex-parent' id = "lowerHalf">     
                <div 
                className="jscad-container"
                style={{
                    //width: windowSize.width*.6,
                    height: windowSize.height*.55
                }}
                > 
                <section 
                id = "threeDView"
                style={{
                   // width: windowSize.width*.6,
                    height: windowSize.height*.58
                }}
                >
                        {mesh ? (
                            <ThreeContext>
                            <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
                            </ThreeContext>
                        ) : (
                            <div
                            style={{ display: "flex", alignItems: "center", fontSize: "2em" }}
                            >
                            Loading...
                            </div>
                        )}
                </section>
                        <div id="arrow-up-menu" className="arrow-up"></div>
                        <div id="viewer_bar"></div>
                        
                </div>
                    <div className="sideBar">
                        Maslow Create
                    </div>
                <div id="bottom_bar"></div>
            </div>
        </>
    );
}