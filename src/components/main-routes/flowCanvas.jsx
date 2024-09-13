import React, { memo, useEffect, useState, useRef } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import Molecule from "../../molecules/molecule.js";
import { createCMenu, cmenu } from "../../js/NewMenu.js";
import GitSearch from "../secondary/GitSearch.jsx";

function onWindowResize() {
  const flowCanvas = document.getElementById("flow-canvas");
  flowCanvas.width = window.innerWidth;
  flowCanvas.height = window.innerHeight * 0.45;
}

window.addEventListener(
  "resize",
  () => {
    onWindowResize();
  },
  false
);

export default memo(function FlowCanvas(props) {
  //Todo this is not very clean
  let loadProject = props.props.loadProject;
  let setActiveAtom = props.props.setActiveAtom;
  let shortCuts = props.props.shortCuts;

  /** State for github molecule search input */
  const [searchingGitHub, setSearchingGitHub] = useState(false);

  const canvasRef = useRef(null);
  const circleMenu = useRef(null);

  // On component mount create a new top level molecule before project load
  useEffect(() => {
    GlobalVariables.canvas = canvasRef;
    GlobalVariables.c = canvasRef.current.getContext("2d");
    /** Only run loadproject() if the project is different from what is already loaded  */
    if (
      !GlobalVariables.loadedRepo ||
      GlobalVariables.currentRepo.repoName !==
        GlobalVariables.loadedRepo.repoName
    ) {
      //Load a blank project
      GlobalVariables.topLevelMolecule = new Molecule({
        x: 0,
        y: 0,
        topLevel: true,
        atomType: "Molecule",
      });
      GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;

      loadProject(GlobalVariables.currentRepo);
    }
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((atom) => {
      atom.update();
    });
  }, []);

  const draw = () => {
    GlobalVariables.c.clearRect(
      0,
      0,
      GlobalVariables.canvas.current.width,
      GlobalVariables.canvas.current.height
    );

    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((atom) => {
      atom.update();
    });
  };

  const mouseMove = (e) => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((molecule) => {
      molecule.mouseMove(e.clientX, e.clientY);
    });
  };

  const keyDown = (e) => {
    //Prevents default behavior of the browser on canvas to allow for copy/paste/delete
    // if(e.srcElement.tagName.toLowerCase() !== ("textarea")
    //     && e.srcElement.tagName.toLowerCase() !== ("input")
    //     &&(!e.srcElement.isContentEditable)
    //     && ['c','v','Backspace'].includes(e.key)){
    //     e.preventDefault()
    // }

    if (e.key == "Backspace" || e.key == "Delete") {
      GlobalVariables.atomsSelected = [];
      //Adds items to the  array that we will use to delete
      GlobalVariables.currentMolecule.copy();
      GlobalVariables.atomsSelected.forEach((item) => {
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(
          (nodeOnTheScreen) => {
            if (nodeOnTheScreen.uniqueID == item.uniqueID) {
              nodeOnTheScreen.deleteNode();
            }
          }
        );
      });
    }

    //Copy /paste listeners
    if (e.key == "Control" || e.key == "Meta") {
      GlobalVariables.ctrlDown = true;
    }

    if (GlobalVariables.ctrlDown && shortCuts.hasOwnProperty([e.key])) {
      e.preventDefault();
      //Copy & Paste
      if (e.key == "c") {
        GlobalVariables.atomsSelected = [];
        GlobalVariables.currentMolecule.copy();
      }
      if (e.key == "v") {
        GlobalVariables.atomsSelected.forEach((item) => {
          let newAtomID = GlobalVariables.generateUniqueID();
          item.uniqueID = newAtomID;
          if (
            item.atomType == "Molecule" ||
            item.atomType == "GitHubMolecule"
          ) {
            item = GlobalVariables.currentMolecule.remapIDs(item);
          }
          GlobalVariables.currentMolecule.placeAtom(item, true);
        });
      }

      //Opens menu to search for github molecule
      if (e.key == "g") {
        setSearchingGitHub(true);
      } else {
        GlobalVariables.currentMolecule.placeAtom(
          {
            parentMolecule: GlobalVariables.currentMolecule,
            x: 0.5,
            y: 0.5,
            parent: GlobalVariables.currentMolecule,
            atomType: `${shortCuts[e.key]}`,
            uniqueID: GlobalVariables.generateUniqueID(),
          },
          true
        );
      }
    }
    //every time a key is pressed
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((molecule) => {
      molecule.keyPress(e.key);
    });
  };

  const keyUp = (e) => {
    if (e.key == "Control" || e.key == "Meta") {
      GlobalVariables.ctrlDown = false;
    }
  };

  /**
   * Called by mouse down
   */
  const onMouseDown = (event) => {
    // if it's a right click show the circular menu
    var isRightMB;
    if ("which" in event) {
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = event.which == 3;
    } else if ("button" in event) {
      // IE, Opera
      isRightMB = event.button == 2;
    }
    // if it's a right click show the circular menu
    if (isRightMB) {
      var doubleClick = false;
      cmenu.show([event.clientX, event.clientY], doubleClick);
      return;
    } else {
      cmenu.hide();
      setSearchingGitHub(false);

      var clickHandledByMolecule = false;
      /*Run through all the atoms on the screen and decide if one was clicked*/
      GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((molecule) => {
        let atomClicked;

        atomClicked = molecule.clickDown(
          event.clientX,
          event.clientY,
          clickHandledByMolecule
        );
        if (atomClicked !== undefined) {
          let idi = atomClicked;
          /* Clicked atom is now the active atom */
          setActiveAtom(idi);
          GlobalVariables.currentMolecule.selected = false;
          clickHandledByMolecule = true;
        }
      });
      if (!clickHandledByMolecule) {
        /* Background click - molecule is active atom */
        setActiveAtom(GlobalVariables.currentMolecule);
        GlobalVariables.currentMolecule.selected = true;
        GlobalVariables.currentMolecule.sendToRender();
      }
    }
  };

  /*Handles click on a molecule - go down level*/
  const onDoubleClick = (event) => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((molecule) => {
      molecule.doubleClick(event.clientX, event.clientY);
    });
    setActiveAtom(GlobalVariables.currentMolecule);
  };

  /**
   * Called by mouse up
   */
  const onMouseUp = (event) => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach((molecule) => {
      molecule.clickUp(event.clientX, event.clientY);
    });
    GlobalVariables.currentMolecule.clickUp(event.clientX, event.clientY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId;

    //Our draw came here
    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  useEffect(() => {
    onWindowResize();
  }, []);

  useEffect(() => {
    createCMenu(circleMenu, setSearchingGitHub);
  }, []);

  let parentLinkPath = [];
  if (GlobalVariables.currentMolecule) {
    parentLinkPath.unshift(GlobalVariables.currentMolecule.name);
    let currentParent = GlobalVariables.currentMolecule.parent;
    while (currentParent) {
      console.log(currentParent);
      let parentName = currentParent.name;
      let parentLink = parentName;
      parentLinkPath.unshift(parentLink);
      currentParent = currentParent.parent ? currentParent.parent : null;
    }
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="flow-canvas"
        tabIndex={0}
        onMouseMove={mouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
        onKeyUp={keyUp}
        onKeyDown={keyDown}
      ></canvas>
      <div
        style={{
          position: "absolute",
          display: "inline",
          zIndex: "5",
          top: "20px",
          left: "55px",
          color: "rgb(255 255 255 / 34%)",
        }}
      >
        {parentLinkPath.map((item, index) => {
          return (
            <a
              className="repo-name-path"
              onClick={() => {
                while (
                  GlobalVariables.currentMolecule &&
                  GlobalVariables.currentMolecule.name !== item
                ) {
                  GlobalVariables.currentMolecule.goToParentMolecule(item);
                  //props.setActiveAtom(GlobalVariables.currentMolecule);
                }
              }}
            >
              {item} /
            </a>
          );
        })}
      </div>
      <div>
        <div id="circle-menu1" className="cn-menu1" ref={circleMenu}></div>
        <GitSearch
          searchingGitHub={searchingGitHub}
          setSearchingGitHub={setSearchingGitHub}
        />
      </div>
    </>
  );
});

{
  /* i'd really like to make the tooltip for the circular menu happen with react here. Have not
                found a way to grab anchor ID from this component yet. 
    <div id="tool_tip_circular" className='tooltip'>hello</div>; */
}
