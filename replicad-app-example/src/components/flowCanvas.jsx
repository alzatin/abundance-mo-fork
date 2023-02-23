import React, {useEffect } from 'react';

function onWindowResize(){
    const canvas = document.getElementById('flow-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*.4;
}

window.addEventListener('resize', () => { onWindowResize() }, false)

export default function FlowCanvas() {
    
    useEffect(() => {
        onWindowResize();
      }, []);

    return (
        <canvas id = "flow-canvas"></canvas>
    );
}