import React, {useEffect, useState } from 'react';
import GlobalVariables from './js/globalvariables';

var flowCanvas;

function onWindowResize(){
    const flowCanvas = document.getElementById('flow-canvas');
    flowCanvas.width = window.innerWidth;
    flowCanvas.height = window.innerHeight*.4;
}

window.addEventListener('resize', () => { onWindowResize() }, false)



export default function FlowCanvas() {

    //const [globalVariables, setGlobalVariables] = useState(GlobalVariables);
    
    useEffect(() => {
        onWindowResize();
    }, []);

    return (
        <canvas id = "flow-canvas"></canvas>
    );
}