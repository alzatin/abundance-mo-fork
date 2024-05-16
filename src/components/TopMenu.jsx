import React, { memo, useEffect, useState, useRef } from "react";
import GlobalVariables from "../js/globalvariables.js";
import ShareDialog from "./ShareDialog.jsx";
import { useNavigate } from "react-router-dom";

function TopMenu(props) {
  let currentMoleculeTop = props.currentMoleculeTop;
  let [shareDialog, setShareDialog] = useState(false);

  const navigate = useNavigate();

  // objects for navigation items in the top menu
  const navItems = [
    {
      id: "Open",
      buttonFunc: () => {
        navigate("/");
      },
      icon: "Open.svg",
    },
    {
      id: "GitHub",
      buttonFunc: () => {
        window.open(GlobalVariables.currentRepo.html_url);
      },
      icon: "GitHub.svg",
    },
    {
      /**
       * Open a new tab with the README page for the project.
       */
      id: "Read Me",
      buttonFunc: () => {
        var url =
          GlobalVariables.currentRepo.html_url + "/blob/master/README.md";
        window.open(url);
      },
      icon: "Open.svg",
    },
    {
      /**
       * Open a new tab with the Bill Of Materials page for the project.
       */
      id: "Bill of Materials",
      buttonFunc: () => {
        var url =
          GlobalVariables.currentRepo.html_url +
          "/blob/master/BillOfMaterials.md";
        window.open(url);
      },
      icon: "Open.svg",
    },
    {
      /**
       * Open a new tab with a sharable copy of the project.
       */
      id: "Share",
      buttonFunc: () => {
        setShareDialog(true);
      },
      icon: "Open.svg",
    },
    {
      id: "Save Project",
      buttonFunc: () => {
        props.setSavePopUp(true);
        props.saveProject(props.setSaveState);
      },
      icon: "Open.svg",
    },
    {
      /**
       * Open pull request if it's a forked project.
       */
      id: "Pull Request",
      buttonFunc: () => {
        window.open(
          "https://github.com/" +
            GlobalVariables.currentRepo.full_name +
            "/compare/" +
            GlobalVariables.currentRepo.default_branch +
            "..." +
            GlobalVariables.currentRepo.owner.login +
            ":" +
            GlobalVariables.currentRepo.default_branch
        );
      },
      icon: "Export.svg",
    },
    {
      /**
       * Open pull request if it's a forked project.
       */
      id: "Export",
      buttonFunc: () => {
        props.setExportPopUp(true);
      },
      icon: "Open.svg",
    },
    {
      /**
       * Send user to GitHub settings page to delete project.
       */
      id: "Delete Project",
      buttonFunc: () => {
        var url = GlobalVariables.currentRepo.html_url + "/settings";
        window.open(url);
        //tryDelete();
      },
      icon: "Open.svg",
    },
  ];

  //{checks for top level variable and show go-up button if this is not top molecule
  //i'm not so sure this useeffect is right. put on list to review
  const TopLevel = () => {
    return (
      <>
        <button
          className="nav-bar go-up-button menu-nav-button"
          onClick={() => {
            GlobalVariables.currentMolecule.goToParentMolecule();
            props.setActiveAtom(GlobalVariables.currentMolecule);
          }}
        >
          <img
            className="nav-img thumnail-logo"
            src={"/imgs/Go Up.svg"}
            key=""
            title=""
          />
        </button>
      </>
    );
  };

  const SaveBar = (props) => {
    if (props.saveState === 100) {
      // delay and then set savepopupstate to false
      var delayInMilliseconds = 2000; //1 second
      setTimeout(function () {
        props.setSavePopUp(false);
      }, delayInMilliseconds);
    }
    return (
      <>
        <div className="save-bar">
          <div className="progress">
            <div
              className="progress-done"
              data-done="70"
              style={{ width: props.saveState + "%", opacity: "1" }}
            >
              {props.saveState !== 100
                ? props.saveState + "%"
                : "Project Saved!"}
            </div>
          </div>
        </div>
      </>
    );
  };

  /*{nav bar toggle component}*/
  const Navbar = (props) => {
    const [navbarOpen, setNavbarOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
      const handler = (event) => {
        if (navbarOpen && ref.current && !ref.current.contains(event.target)) {
          setNavbarOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => {
        // Cleanup the event listener
        document.removeEventListener("mousedown", handler);
      };
    }, [navbarOpen]);
    return (
      <>
        <nav ref={ref} className="navbar">
          <button
            className="toggle menu-nav-button"
            onClick={() => setNavbarOpen((prev) => !prev)}
          >
            {navbarOpen ? (
              <img
                className={`thumnail-logo nav-img ${
                  !props.currentMoleculeTop ? " rotati-right" : ""
                }`}
                src={"/imgs/three-menu.svg"}
              />
            ) : (
              <img
                className={`thumnail-logo nav-img  ${
                  !props.currentMoleculeTop ? " rotati-plus " : "rotati"
                }`}
                src={"/imgs/three-menu.svg"}
              />
            )}
          </button>

          <ul className={`menu-nav${navbarOpen ? " show-menu" : ""}`}>
            {navItems.map((item, index) => (
              <button key={item.id} className="menu-nav-button">
                <img
                  className=" thumnail-logo"
                  alt={item}
                  src={"/imgs/" + item.id + ".svg"}
                  key={item.id}
                  title={item.id + "-button"}
                  onClick={item.buttonFunc}
                />
              </button>
            ))}
          </ul>
        </nav>
      </>
    );
  };

  return (
    <>
      {props.savePopUp ? (
        <SaveBar
          saveState={props.saveState}
          savePopUp={props.savePopUp}
          setSavePopUp={props.setSavePopUp}
        />
      ) : null}
      <ShareDialog shareDialog={shareDialog} setShareDialog={setShareDialog} />
      {currentMoleculeTop ? <TopLevel /> : null}
      <Navbar currentMoleculeTop={currentMoleculeTop} />
    </>
  );
}

export default memo(TopMenu);
