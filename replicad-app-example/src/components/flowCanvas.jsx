import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables';
import Molecule from './molecules/molecule';

var flowCanvas;

function onWindowResize(){
    const flowCanvas = document.getElementById('flow-canvas');
    flowCanvas.width = window.innerWidth;
    flowCanvas.height = window.innerHeight*.4;
}

window.addEventListener('resize', () => { onWindowResize() }, false)



export default function FlowCanvas() {

    const canvasRef = useRef(null);
    const [globalVariables, setGlobalVariables] = useState(GlobalVariables);

    useEffect(() => {
        GlobalVariables.canvas = canvasRef;

        GlobalVariables.c = canvasRef.current.getContext('2d')

        if(!GlobalVariables.runMode){ //If we are in CAD mode load an empty project as a placeholder
            GlobalVariables.currentMolecule = new Molecule({
                x: GlobalVariables.pixelsToWidth(GlobalVariables.canvas.width - 20),
                y: GlobalVariables.pixelsToHeight(GlobalVariables.canvas.height/2),
                topLevel: true, 
                name: 'Maslow Create',
                atomType: 'Molecule',
                uniqueID: GlobalVariables.generateUniqueID()
            })
        }

        GlobalVariables.c.moveTo(0, 0)
        GlobalVariables.c.lineTo(500, 500)
        GlobalVariables.c.fill()
        GlobalVariables.c.stroke()

        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
            atom.update()
        })

    }, []);

    const draw = () => {
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
            atom.update()
        })
    }

    useEffect(() => {
    
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let frameCount = 0
        let animationFrameId
        
        //Our draw came here
        const render = () => {
          frameCount++
          draw(context, frameCount)
          animationFrameId = window.requestAnimationFrame(render)
        }
        render()
        
        return () => {
          window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])
    
    useEffect(() => {
        onWindowResize();
    }, []);

    return (
        <canvas ref={canvasRef} id = "flow-canvas"></canvas>
    );
}