import React, {useEffect, useState } from 'react';
import ThreeContext from "./ThreeContext.jsx";
import ReplicadMesh from "./ReplicadMesh.jsx";



export default function LowerHalf(mesh, setMesh) {
    
    const onWindowResize = ()=>{
        const threeView = document.getElementById('threeDView');
        threeView.width = window.innerWidth;
        threeView.height = window.innerHeight*.8;
    }

    useEffect(() => {
        onWindowResize();
        window.addEventListener('resize', () => { onWindowResize() }, false)
      }, []);

    return (
        <>
            <div className='parent flex-parent' id = "lowerHalf">     
                <div className="jscad-container"> 
                    <section 
                    id = "threeDView" 
                    style={{ width: 600 }}
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