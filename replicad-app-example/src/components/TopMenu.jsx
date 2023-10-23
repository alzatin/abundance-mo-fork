import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

function TopMenu(props) {
  const [currentMoleculeTop, setTop] = useState(false);
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
        saveProject();
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
    { owner, repo, base, changes }
  ) {
    //this.progressSave(30)
    let response;
    console.log(octokit);
    if (!base) {
      octokit
        .request("GET /repos/{owner}/{repo}", {
          owner: owner,
          repo: repo,
        })
        .then((response) => {
          console.log(response);
          console.log(response.data.default_branch);
          base = response.data.default_branch;
          octokit.rest.repos
            .listCommits({
              owner,
              repo,
              sha: base,
              per_page: 1,
            })
            .then((response) => {
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
                          console.warn("Project saved");
                        });
                    });
                });
            });
        });
    }

    //this.progressSave(90)

    //this.progressSave(100)
  };
  const saveProject = async () => {
    var authorizedUserOcto;

    var jsonRepOfProject = GlobalVariables.topLevelMolecule.serialize();
    jsonRepOfProject.filetypeVersion = 1;
    jsonRepOfProject.circleSegmentSize = GlobalVariables.circleSegmentSize;
    const projectContent = JSON.stringify(jsonRepOfProject, null, 4);

    // Initialize with OAuth.io app public key
    if (window.location.href.includes("private")) {
      OAuth.initialize("6CQQE8MMCBFjdWEjevnTBMCQpsw"); //app public key for repo scope
    } else {
      OAuth.initialize("BYP9iFpD7aTV9SDhnalvhZ4fwD8"); //app public key for public_repo scope
    }
    var currentUser;
    // Use popup for oauth
    OAuth.popup("github").then((github) => {
      authorizedUserOcto = new Octokit({
        auth: github.access_token,
      });
      authorizedUserOcto
        .request("GET /user", {})
        .then((response) => {
          currentUser = response.data.login;
          GlobalVariables.currentUser = currentUser;
        })
        .then(() => {
          createCommit(authorizedUserOcto, {
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
          });
        });
    });
  };

  //can't figure out right now but i want to switch the delete button from just going to github to actually authorizing delete
  const tryDelete = () => {
    // Initialize with OAuth.io app public key
    if (window.location.href.includes("private")) {
      OAuth.initialize("6CQQE8MMCBFjdWEjevnTBMCQpsw"); //app public key for repo scope
    } else {
      OAuth.initialize("BYP9iFpD7aTV9SDhnalvhZ4fwD8"); //app public key for public_repo scope
    }

    // Use popup for oauth
    OAuth.popup("github").then((github) => {
      /**
       * Oktokit object to access github
       * @type {object}
       */
      authorizedUserOcto = new Octokit({
        auth: github.access_token,
      });
      var owner = GlobalVariables.currentUser;
      var repo = GlobalVariables.currentRepo;
      //getting current user post authetication
      authorizedUserOcto.rest.repos.delete({
        owner,
        repo,
      });
    });
  };

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
