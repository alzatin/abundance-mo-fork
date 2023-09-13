import React, {useEffect, useState, useRef } from 'react';
import GlobalVariables from './js/globalvariables';
import Molecule from './molecules/molecule';
//import CMenu from 'circular-menu';
import {createCMenu, cmenu} from './js/NewMenu.js'


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

    useEffect(() => {
        GlobalVariables.writeToDisplay = (id, resetView = false) => {
            cad.generateDisplayMesh(id).then((m) => setMesh(m));
        }

        GlobalVariables.cad = cad;

        // cad.rectangle("12345", 10,5).then((m) => {
        //     GlobalVariables.writeToDisplay("12345");
        // });
    });

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

    const keyDown = (e) => {
        //Prevents default behavior of the browser on canvas to allow for copy/paste/delete
        // if(e.srcElement.tagName.toLowerCase() !== ("textarea")
        //     && e.srcElement.tagName.toLowerCase() !== ("input")
        //     &&(!e.srcElement.isContentEditable)
        //     && ['c','v','Backspace'].includes(e.key)){
        //     e.preventDefault()
        // }
    
        if (e.key == "Backspace" || e.key == "Delete") {
            GlobalVariables.atomsSelected = []
            //Adds items to the  array that we will use to delete
            GlobalVariables.currentMolecule.copy()
            GlobalVariables.atomsSelected.forEach(item => {
                GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(nodeOnTheScreen => {
                    if(nodeOnTheScreen.uniqueID == item.uniqueID){
                        nodeOnTheScreen.deleteNode()
                    }
                })
            })
        }    

        /** 
        * Object containing letters and values used for keyboard shortcuts
        * @type {object?}
        */ 
        var shortCuts = {
            a: "Assembly",
            b: "ShrinkWrap",//>
            c: "Copy",
            d: "Difference",
            e: "Extrude",
            g: "GitHub", // Not working yet
            i: "Input",
            j: "Translate", 
            k: "Rectangle",
            l: "Circle",
            m: "Molecule",
            s: "Save", 
            v: "Paste",
            x: "Equation",
            y: "Code", //is there a more natural code letter? can't seem to prevent command t new tab behavior
            z: "Undo" //saving this letter 
        }

        //Copy /paste listeners
        if (e.key == "Control" || e.key == "Meta") {
            GlobalVariables.ctrlDown = true
        }  

        if (GlobalVariables.ctrlDown && shortCuts.hasOwnProperty([e.key])) {
            
            e.preventDefault()
            //Copy & Paste
            if (e.key == "c") {
                GlobalVariables.atomsSelected = []
                GlobalVariables.currentMolecule.copy()
            }
            if (e.key == "v") {
                GlobalVariables.atomsSelected.forEach(item => {
                    let newAtomID = GlobalVariables.generateUniqueID()
                    item.uniqueID = newAtomID
                    GlobalVariables.currentMolecule.placeAtom(item, true)
                })   
            }
            //Save project
            if (e.key == "s") {
                GlobalVariables.gitHub.saveProject()
            }
            //Opens menu to search for github molecule
            if (e.key == "g") {
                showGitHubSearch()
            }
            
            else { 

                GlobalVariables.currentMolecule.placeAtom({
                    parentMolecule: GlobalVariables.currentMolecule, 
                    x: 0.5,
                    y: 0.5,
                    parent: GlobalVariables.currentMolecule,
                    atomType: `${shortCuts[e.key]}`,
                    uniqueID: GlobalVariables.generateUniqueID()
                }, true)
            }
            
        }
        //every time a key is pressed
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {  
            molecule.keyPress(e.key)      
        })
       
    }
    
    const keyUp = (e) => {
        if (e.key == "Control" || e.key == "Meta") {
            GlobalVariables.ctrlDown = false
        }
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
        // if it's a right click show the menu
        if(isRightMB){
            var doubleClick = false;
            cmenu.show([event.clientX, event.clientY],doubleClick)
            return
        }
        else{
            cmenu.hide()
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
        
        
        //hide search menu if it is visible
        // if (!document.querySelector('#canvas_menu').contains(event.target)) {
        //     const menu = document.querySelector('#canvas_menu')
        //     menu.classList.add('off')
        //     menu.style.top = '-200%'
        //     menu.style.left = '-200%'
        // }
        
    }

    const onDoubleClick = (event) => {
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
            molecule.doubleClick(event.clientX,event.clientY)
        })
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
            tabIndex={0}
            onMouseMove={mouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onDoubleClick={onDoubleClick}
            onKeyUp={keyUp}
            onKeyDown={keyDown}
            ></canvas>
        </>
    );
}