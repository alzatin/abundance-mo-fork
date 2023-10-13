import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function TopMenu(props) {
  const navItems = [
    {
      id: "Open",
      buttonFunc: () => {
        props.setPopUpOpen(true);
      },
      icon: "Open.svg",
    },
    {
      id: "GitHub",
      buttonFunc: () => {
        window.open("https://github.com/join");
      },
      icon: "GitHub.svg",
    },
    {
      id: "Read Me",
      buttonFunc: () => {
        props.setPopUpOpen(true);
      },
      icon: "Open.svg",
    },
    {
      id: "Bill of Materials",
      buttonFunc: () => {
        props.setPopUpOpen(true);
      },
      icon: "Open.svg",
    },
    {
      id: "Share",
      buttonFunc: () => {
        props.setPopUpOpen(true);
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
      id: "Delete Project",
      buttonFunc: () => {
        props.setPopUpOpen(true);
      },
      icon: "Open.svg",
    },
  ];
  /*{checks for top level variable and show go-up button if this is not top molecule  ::::
      i think this is the way of checking for molecule.toplevel but i'm wondering if there's a more efficient way that doesn't use Useeffect()
      } (CAN'T FIGURE OUT HOW TO MAKE IT WAIT FOR GLOBALVARIABLES)*/
  const TopLevel = () => {
    const [currentMoleculeTop, setTop] = useState(false);

    const ref = useRef();
    useEffect(() => {
      if (false) {
        setTop(false);
      }
    }, [currentMoleculeTop]);
    return (
      <>
        {currentMoleculeTop && (
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
  const Navbar = () => {
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
                className="thumnail-logo nav-img"
                src={"/imgs/three-menu.svg"}
              />
            ) : (
              <img
                className="thumnail-logo nav-img rotati"
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
      <TopLevel />
      <Navbar />
    </>
  );
}

export default TopMenu;
