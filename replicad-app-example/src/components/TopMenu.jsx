import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function TopMenu(props) {
  const [currentMoleculeTop, setTop] = useState(true);
  // objects for navigation items in the top menu
  const navItems = [
    {
      id: "Open",
      buttonFunc: () => {
        if (GlobalVariables.currentUser != undefined) {
          props.setIsLoggedIn(true);
        }
        props.setPopUpOpen(true);
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
        var ID = GlobalVariables.currentRepo.id;
        window.open("/run?" + ID);
      },
      icon: "Open.svg",
    },
    {
      id: "Save Project",
      buttonFunc: () => {
        GlobalVariables.gitHub.saveProject();
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
      },
      icon: "Open.svg",
    },
  ];

  /*{checks for top level variable and show go-up button if this is not top molecule  ::::
      i think this is the way of checking for molecule.toplevel but i'm wondering if there's a more efficient way that doesn't use Useeffect()
      } (CAN'T FIGURE OUT HOW TO MAKE IT WAIT FOR GLOBALVARIABLES)*/
  const TopLevel = (props) => {
    const ref = useRef();
    // if (GlobalVariables.currentMolecule.topLevel) changes check if it's still a top level molecule to display goUp button
    useEffect(() => {
      if (GlobalVariables.currentMolecule !== undefined) {
        if (!GlobalVariables.currentMolecule.topLevel) {
          props.setTop(true);
        }
      }
    }, []);
    return (
      <>
        {props.currentMoleculeTop && (
          <img
            className="nav-img nav-bar thumnail-logo"
            src={"/imgs/Go Up.svg"}
            key=""
            title=""
          />
        )}
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
      <TopLevel currentMoleculeTop={currentMoleculeTop} setTop={setTop} />
      <Navbar currentMoleculeTop={currentMoleculeTop} />
    </>
  );
}

export default TopMenu;
