import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables';
import Molecule from './molecules/molecule';
import {createCMenu} from './js/NewMenu.js'


var flowCanvas;

function onWindowResize(){
    const flowCanvas = document.getElementById('flow-canvas');
    flowCanvas.width = window.innerWidth;
    flowCanvas.height = window.innerHeight*.4;
}

window.addEventListener('resize', () => { onWindowResize() }, false)



export default function FlowCanvas(displayProps) {

    //Todo this is not very clean
    let cad = displayProps.displayProps.cad;
    let size = displayProps.displayProps.size;
    let setMesh = displayProps.displayProps.setMesh;
    let mesh = displayProps.displayProps.mesh;

    // useEffect(() => {
    //     console.log("Circle: ");
    //     cad.circle("12345", 10).then((m) => {
    //         console.log("Circle function returned");
    //         console.log(m);
    //         cad.generateDisplayMesh("12345").then((m) => setMesh(m));
    //     });
    // });

    const canvasRef = useRef(null);
    const circleMenu = useRef(null);
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
        GlobalVariables.c.clearRect(0, 0, GlobalVariables.canvas.current.width, GlobalVariables.canvas.current.height)
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
            atom.update()
        })
    }

    const mouseMove = (e) => {
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
            molecule.clickMove(event.clientX,event.clientY)
        })
    }

    /** 
    * Called by mouse down
    */
    const onMouseDown = (event) => {
        
        var isRightMB
        if ("which" in event){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            isRightMB = event.which == 3
        }
        else if ("button" in event){  // IE, Opera 
            isRightMB = event.button == 2
        }
        if(isRightMB){
            return
        }

        var clickHandledByMolecule = false

        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
            
            if (molecule.clickDown(event.clientX,event.clientY,clickHandledByMolecule) == true){
                clickHandledByMolecule = true
            }

        })
        
        //Draw the selection box
        // if (!clickHandledByMolecule){
        //     GlobalVariables.currentMolecule.placeAtom({
        //         parentMolecule: GlobalVariables.currentMolecule, 
        //         x: GlobalVariables.pixelsToWidth(event.clientX),
        //         y: GlobalVariables.pixelsToHeight(event.clientY),
        //         parent: GlobalVariables.currentMolecule,
        //         name: 'Box',
        //         atomType: 'Box'
        //     }, null, GlobalVariables.availableTypes)
        // }
        
        if(!clickHandledByMolecule){
            GlobalVariables.currentMolecule.backgroundClick() 
        }
        else{
            GlobalVariables.currentMolecule.selected = false
        }
        
        //hide the menu if it is visible
        // if (!document.querySelector('#circle-menu1').contains(event.target)) {
        //     cmenu.hide()
        // }
        //hide search menu if it is visible
        // if (!document.querySelector('#canvas_menu').contains(event.target)) {
        //     const menu = document.querySelector('#canvas_menu')
        //     menu.classList.add('off')
        //     menu.style.top = '-200%'
        //     menu.style.left = '-200%'
        // }
        //hide the menu if it is visible
        // if (!document.querySelector('#straight_menu').contains(event.target)) {
        //     closeTopMenu()
        //     let options = document.querySelectorAll('.option')
        //     Array.prototype.forEach.call(options, a => {
        //         a.classList.remove("openMenu") 
        //     })
        // }
        
    }
   
    /** 
    * Called by mouse up
    */
    const onMouseUp = (event) => {
        //every time the mouse button goes up
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
            molecule.clickUp(event.clientX,event.clientY)
        })
        GlobalVariables.currentMolecule.clickUp(event.clientX,event.clientY)
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

    useEffect(() => {
        createCMenu(circleMenu);
    }, []);

    return (
        <>
            <div>
                <div id="circle-menu1" className="cn-menu1" ref={circleMenu} ></div>
                <div id="canvas_menu">
                    <input type="text" id="menuInput" onfocusout="value=''" placeholder="Search for atom.." className = "menu_search_canvas"></input>
                    <ul id="githubList" className = "menu_list tabcontent">
                    </ul>
                </div>
            </div>
            <canvas 
            ref={canvasRef} 
            id = "flow-canvas"
            onMouseMove={mouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            ></canvas>
        </>
    );
}