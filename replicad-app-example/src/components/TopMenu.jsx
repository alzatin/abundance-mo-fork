import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import ShareDialog from "./ShareDialog.jsx";

function TopMenu(props) {
  const [currentMoleculeTop, setTop] = useState(false);
  const [saveState, setSaveState] = useState(0);
  const [savePopUp, setSavePopUp] = useState(false);

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
        var shareDialog = document.querySelector("dialog");
        shareDialog.showModal();
      },
      icon: "Open.svg",
    },
    {
      id: "Save Project",
      buttonFunc: () => {
        setSavePopUp(true);
        saveProject(setSaveState);
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
        //tryDelete();
      },
      icon: "Open.svg",
    },
  ];

  /**
   * Create a commit as part of the saving process.
   */
  const createCommit = async function (
    octokit,
    { owner, repo, base, changes },
    setState
  ) {
    setState(20);
    if (!base) {
      octokit
        .request("GET /repos/{owner}/{repo}", {
          owner: owner,
          repo: repo,
        })
        .then((response) => {
          setState(30);
          base = response.data.default_branch;
          octokit.rest.repos
            .listCommits({
              owner,
              repo,
              sha: base,
              per_page: 1,
            })
            .then((response) => {
              setState(40);
              let latestCommitSha = response.data[0].sha;
              const treeSha = response.data[0].commit.tree.sha;
              octokit.rest.git
                .createTree({
                  owner,
                  repo,
                  base_tree: treeSha,
                  tree: Object.keys(changes.files).map((path) => {
                    if (changes.files[path] != null) {
                      return {
                        path,
                        mode: "100644",
                        content: changes.files[path],
                      };
                    } else {
                      return {
                        path,
                        mode: "100644",
                        sha: null,
                      };
                    }
                  }),
                })
                .then((response) => {
                  setState(60);
                  const newTreeSha = response.data.sha;

                  octokit.rest.git
                    .createCommit({
                      owner,
                      repo,
                      message: changes.commit,
                      tree: newTreeSha,
                      parents: [latestCommitSha],
                    })
                    .then((response) => {
                      setState(80);
                      latestCommitSha = response.data.sha;
                      octokit.rest.git
                        .updateRef({
                          owner,
                          repo,
                          sha: latestCommitSha,
                          ref: "heads/" + base,
                          force: true,
                        })
                        .then((response) => {
                          setState(90);
                          console.warn("Project saved");
                          setState(100);
                        });
                    });
                });
            });
        });
    }
  };
  /**
   * Saves project by making a commit to the Github repository.
   */
  const saveProject = async (setState) => {
    setState(5);
    var authorizedUserOcto = props.authorizedUserOcto;

    var jsonRepOfProject = GlobalVariables.topLevelMolecule.serialize();
    jsonRepOfProject.filetypeVersion = 1;
    jsonRepOfProject.circleSegmentSize = GlobalVariables.circleSegmentSize;
    const projectContent = JSON.stringify(jsonRepOfProject, null, 4);

    setState(10);
    createCommit(
      props.authorizedUserOcto,
      {
        owner: GlobalVariables.currentUser,
        repo: GlobalVariables.currentRepo.name,
        changes: {
          files: {
            "BillOfMaterials.md": "bom",
            "README.md": "readme",
            "project.svg": "finalSVG",
            "project.maslowcreate": projectContent,
          },
          commit: "Autosave",
        },
      },
      setState
    );
  };
  //{checks for top level variable and show go-up button if this is not top molecule
  const TopLevel = (props) => {
    const ref = useRef();
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
          <h1>Saving</h1>
          <div className="progress">
            <div
              className="progress-done"
              data-done="70"
              style={{ width: props.saveState + "%", opacity: "1" }}
            >
              {props.saveState !== 100
                ? props.saveState + "%"
                : "Project Saved"}
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
      {savePopUp ? (
        <SaveBar
          saveState={saveState}
          savePopUp={savePopUp}
          setSavePopUp={setSavePopUp}
        />
      ) : null}
      <ShareDialog />
      <TopLevel currentMoleculeTop={currentMoleculeTop} setTop={setTop} />
      <Navbar currentMoleculeTop={currentMoleculeTop} />
    </>
  );
}

export default TopMenu;
