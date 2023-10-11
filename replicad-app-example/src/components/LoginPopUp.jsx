import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { OAuth } from "oauthio-web";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import Molecule from "./molecules/molecule.js";

/*--Credit to https://codepen.io/colorlib/pen/rxddKy */
//var PopUpState = true;

//Login pop up component logic: pop up appears introducing logo and github login button,
// if user gets authenticated in the tryLogin function, then the pop up disappears and the projects appear, if they do notget authenticated, then the pop up stays and the user can browse projects

var octokit = null;
var currentUser = null;

/**
 * Loads a project from github by name.
 */
const loadProject = function (project) {
  console.log(project);

  GlobalVariables.gitHub.totalAtomCount = 0;
  GlobalVariables.gitHub.numberOfAtomsToLoad = 0;

  GlobalVariables.startTime = new Date().getTime();

  /* if(typeof intervalTimer != undefined){
        clearInterval(intervalTimer) //Turn off auto saving
    }*/

  //Clear and hide the popup
  /* while (popup.firstChild) {
        popup.removeChild(popup.firstChild)
    }
    popup.classList.add('off')
    */
  const currentRepoName = project.name;
  //Load a blank project
  GlobalVariables.topLevelMolecule = new Molecule({
    x: 0,
    y: 0,
    topLevel: true,
    atomType: "Molecule",
  });

  GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;

  octokit
    .request("GET /repos/{owner}/{repo}/contents", {
      owner: project.owner,
      repo: project.name,
    })
    .then((response) => {
      console.log(response);
    });
  /*octokit.repos.getContent({
        owner: currentUser,
        repo: projectName,
        path: 'project.maslowcreate'
    }).then(result => {
        //content will be base64 encoded
        let rawFile = JSON.parse(atob(result.data.content))
        
        if(rawFile.circleSegmentSize){
            GlobalVariables.circleSegmentSize = rawFile.circleSegmentSize
        }
        
        if(rawFile.filetypeVersion == 1){
            GlobalVariables.topLevelMolecule.deserialize(rawFile)
        }
        else{
            GlobalVariables.topLevelMolecule.deserialize(this.convertFromOldFormat(rawFile))
        }
    })*/
  /*octokit.repos.get({
        owner: currentUser,
        repo: currentRepoName
    }).then(result => {
        GlobalVariables.fork = result.data.fork
        if(!GlobalVariables.fork){
            document.getElementById("pull_top").style.display = "none"
        }
        else{
            document.getElementById("pull_top").style.display = "inline"
        }
    })*/
};

// initial pop up construction with github login button
const InitialLog = ({ tryLogin, tryNoAuth }) => {
  /**
   * Try to login using the oauth popup.
   */
  return (
    <div className="login-page">
      <div className="form animate fadeInUp one">
        <div id="gitSide" className="logindiv">
          <img className="logo" src="/imgs/maslow-logo.png" alt="logo" />
          <div id="welcome">
            <img
              src="/imgs/maslowcreate.svg"
              alt="logo"
              style={{ width: "300px", padding: "10px", margin: "0" }}
            />
          </div>
          <p style={{ padding: "0 20px" }}>
            Maslow Create projects are stored through GitHub. You control your
            files.{" "}
          </p>
          <form className="login-form">
            <button
              type="button"
              id="loginButton"
              onClick={tryLogin}
              style={{ height: "40px" }}
            >
              Login With GitHub
            </button>
            <p className="message">
              Don't have an account?{" "}
              <a href="https://github.com/join">Create a free account</a>
            </p>
          </form>
        </div>
        <div id="nonGitSide" className="logindiv curiousBrowse">
          <p
            style={{
              justifyContent: "flex-start",
              display: "inline",
            }}
          >
            Check out what others have designed in Maslow Create
          </p>
          <form className="login-form">
            <button
              type="button"
              className="submit-btn browseButton"
              onClick={() => {
                tryNoAuth();
              }}
              id="browseNonGit"
              style={{ padding: "0 30px" }}
            >
              Browse all projects
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* to add: if current user is null show this next part */
const ShowProjects = (props) => {
  const [nodes, setNodes] = useState([]);
  const [projectsLoaded, setStateLoaded] = React.useState(false);
  const [projectPopUp, setNewProjectPopUp] = useState(false);
  //if there's a user make initial project query // only make API call if user changes

  //replaces the loaded projects if the user clicks on new project button
  const NewProjectPopUp = () => {
    return (
      <>
        <div>
          <div className="form" style={{ color: "whitesmoke" }}>
            <h1 style={{ fontSize: "1em" }}>Create a new project</h1>
            <form className="login-form" action="#">
              <div className="form-row">
                <div className="input-data">
                  <input id="project-name" type="text" required></input>
                  <div className="underline"></div>
                  <label for="">Project Name</label>
                </div>
              </div>
              <div className="form-row">
                <div className="input-data">
                  <input type="text" required></input>
                  <div className="underline"></div>
                  <label for="">Tags</label>
                </div>
              </div>
              <select id="license-options"></select>
              <div className="form-row">
                <div className="input-data textarea">
                  <textarea rows="8" cols="80"></textarea>
                  <br />
                  <div className="underline"></div>
                  <label for="">Project Description</label>
                  <br />

                  <div className="submit-btn">
                    <div className="input-data">
                      <div className="inner"></div>
                      <input type="Create" value="Create"></input>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };
  const ClassicBrowse = () => {
    return (
      <>
        <div className="top_browse_menu">
          <div
            onClick={() => {
              setNewProjectPopUp(true);
            }}
            className="newProjectDiv"
          >
            <span style={{ alignSelf: "center" }}>Start a new project</span>
            <img
              src="/imgs/defaultThumbnail.svg"
              style={{ height: "80%", float: "left" }}
            ></img>
          </div>
          <div className="newProjectDiv">
            <span style={{ alignSelf: "center" }}>Browse Other Projects</span>
            <img
              src="/imgs/defaultThumbnail.svg"
              style={{ height: "80%", float: "right" }}
            ></img>
          </div>
        </div>

        <div className="project-item-div">
          <ul>
            {projectsLoaded ? (
              <ul>
                <AddProject />
              </ul>
            ) : (
              "no"
            )}
          </ul>
        </div>
      </>
    );
  };

  useEffect(() => {
    octokit
      .request("GET /search/repositories", {
        q: " " + "fork:true user:" + currentUser + " topic:maslowcreate",
        per_page: 50,
        headers: {
          accept: "application/vnd.github.mercy-preview+json",
        },
      })
      .then((result) => {
        var userRepos = [];
        result.data.items.forEach((repo) => {
          //this.addProject(repo.name, repo.id, repo.owner.login, repo.created_at, repo.updated_at, owned, thumbnailPath)
          userRepos.push(repo);
        });
        setNodes([...userRepos]);
        setStateLoaded(true);
      });
  }, [currentUser]);

  const AddProject = () => {
    //const thumbnailPath = "https://raw.githubusercontent.com/"+node.full_name+"/master/project.svg?sanitize=true"
    return nodes.map((node) => (
      <div
        className="project"
        id={node.name}
        onClick={(e) => loadProject(node, e)}
      >
        <li>{node.name}</li>
        <img className="project_image" src="/imgs/defaultThumbnail.svg"></img>
      </div>
    ));
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  return (
    <>
      <div className="middleBrowse" style={{ marginTop: "35px" }}>
        <div
          id="welcome"
          style={{ display: "flex", margin: "10px", alignItems: "center" }}
        >
          <img
            src="/imgs/maslow-logo.png"
            alt="logo"
            style={{ width: "25px", height: "25px", borderRadius: "50%" }}
          />
          <img
            src="/imgs/maslowcreate.svg"
            alt="logo"
            style={{ height: "20px", padding: "10px" }}
          />
          <button
            className="form browseButton githubSign"
            id="loginButton2"
            style={{ width: "90px", fontSize: ".7rem", marginLeft: "auto" }}
          >
            Login
          </button>
          <button
            className="form browseButton githubSign"
            onClick={() => openInNewTab("https://github.com/join")}
            style={{ width: "130px", fontSize: ".7rem", marginLeft: "5px" }}
          >
            Create an Account
          </button>
        </div>
        <div className="search-bar-div">
          <input
            type="text"
            contentEditable="true"
            placeholder="Search for project.."
            className="menu_search browseButton"
            id="project_search"
          />
          <img
            src="/imgs/search_icon.svg"
            alt="search"
            style={{
              width: "20px",
              color: "white",
              marginRight: "5px",
              opacity: "0.5",
            }}
          />
        </div>
      </div>
      {projectPopUp ? <NewProjectPopUp /> : <ClassicBrowse />}
    </>
  );
};

function LoginPopUp() {
  const tryNoAuth = function () {
    octokit = new Octokit();
    //getting current user post authetication
    octokit
      .request("GET /search/repositories", {
        q: "topic:maslowcreate",
        per_page: 50,
        headers: {
          accept: "application/vnd.github.mercy-preview+json",
        },
      })
      .then((result) => {
        var noUserRepos = [];
        result.data.items.forEach((repo) => {
          noUserRepos.push(repo);
        });
        console.log(noUserRepos);
      });
  };

  const tryLogin = function (props) {
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

      octokit = new Octokit({
        auth: github.access_token,
      });
      //getting current user post authetication
      octokit.request("GET /user", {}).then((response) => {
        currentUser = response.data.login;
        if (currentUser) {
          setIsLoggedIn(true);
        }
      });
    });
  };
  const [closed, setTop] = useState(false);
  const [isloggedIn, setIsLoggedIn] = React.useState(false);

  let popUpContent;
  if (!closed) {
    if (isloggedIn) {
      popUpContent = <ShowProjects user={currentUser} />;
    } else {
      popUpContent = <InitialLog tryLogin={tryLogin} tryNoAuth={tryNoAuth} />;
    }
    return (
      <div
        className="login-popup"
        id="projects-popup"
        style={{
          padding: "0",
          backgroundColor: "#f9f6f6",
          border: "10px solid #3e3d3d",
        }}
      >
        <div>
          {" "}
          <button className="closeButton" onClick={() => setTop(true)}>
            <img></img>
          </button>{" "}
        </div>
        {popUpContent}
      </div>
    );
  }
}

export default LoginPopUp;
