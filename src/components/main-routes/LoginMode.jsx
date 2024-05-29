import React, { useEffect, useState } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { Link } from "react-router-dom";
import globalvariables from "../../js/globalvariables.js";
import NewProjectPopUp from "../secondary/NewProjectPopUp.jsx";

/**
 * The octokit instance which allows interaction with GitHub.
 * @type {object}
 */
var octokit = null;

/**
 * Initial log component displays pop Up to either attempt Github login/browse projects
 *
 */
const InitialLog = (props) => {
  return (
    <div className="login-page">
      <div className="form animate fadeInUp one">
        <div id="gitSide" className="logindiv">
          <img className="logo" src="/imgs/maslow-logo.png" alt="logo" />
          <div id="welcome">
            <img
              src="/imgs/abundance.svg"
              alt="logo"
              style={{ width: "300px", padding: "10px", margin: "0" }}
            />
          </div>
          <p style={{ padding: "0 20px" }}>
            Abundance projects are stored through GitHub. You control your
            files.{" "}
          </p>
          <form className="login-form">
            <button
              type="button"
              id="loginButton"
              className="submit-btn"
              onClick={props.tryLogin}
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
            Check out what others have designed in Abundance
          </p>

          <button
            type="button"
            onClick={() => {
              props.setBrowsing(true);
            }}
            className="submit-btn"
            id="browseNonGit"
            style={{ padding: "0 30px" }}
          >
            Browse all projects
          </button>
        </div>
      </div>
    </div>
  );
};

/* to add: if current user is null show this next part */
const ShowProjects = (props) => {
  const [nodes, setNodes] = useState([]);
  const [projectsLoaded, setStateLoaded] = React.useState(false);
  const [searchBarValue, setSearchBarValue] = useState("");
  const exportPopUp = props.exportPopUp;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;

  // conditional query for maslow projects
  useEffect(() => {
    var query;
    if (props.user == "" || props.userBrowsing) {
      query = searchBarValue + " topic:abundance-project";
    } else {
      query =
        searchBarValue + " user:" + props.user + " topic:abundance-project";
    }
    octokit = new Octokit();
    octokit
      .request("GET /search/repositories", {
        q: query,
        per_page: 50,
        headers: {
          accept: "application/vnd.github.mercy-preview+json",
        },
      })
      .then((result) => {
        var userRepos = [];
        result.data.items.forEach((repo) => {
          userRepos.push(repo);
        });
        setNodes([...userRepos]);
        setStateLoaded(true);
      })
      .catch((err) => {
        window.alert(
          "Error loading projects. Please wait a few minutes then try again."
        );
      });
  }, [props.userBrowsing, searchBarValue]);

  // Browse display
  const ClassicBrowse = () => {
    const loadBrowse = () => {
      props.setBrowsing(!props.userBrowsing);
      setStateLoaded(true);
    };
    const handleSearchChange = (e) => {
      if (e.code == "Enter") {
        setSearchBarValue(e.target.value);
      }
    };
    const [searchBarType, setSearchBarType] = useState(searchBarValue);
    return (
      <>
        {props.isloggedIn ? (
          <div className="top_browse_menu">
            <div
              onClick={() => {
                setExportPopUp(true);
              }}
              className="newProjectDiv"
            >
              <span style={{ alignSelf: "center" }}>Start a new project</span>
              <img
                src="/imgs/defaultThumbnail.svg"
                style={{ height: "80%", float: "left" }}
              ></img>
            </div>
            <div className="newProjectDiv" onClick={() => loadBrowse()}>
              <span style={{ alignSelf: "center" }}>
                {!props.userBrowsing
                  ? "Browse Other Projects"
                  : "Return to my Projects"}
              </span>
              <img
                src="/imgs/defaultThumbnail.svg"
                style={{ height: "80%", float: "right" }}
              ></img>
            </div>
          </div>
        ) : null}
        <div className="search-bar-div">
          <input
            type="text"
            key="project-search-bar"
            placeholder={searchBarType}
            value={searchBarType}
            onChange={(e) => setSearchBarType(e.target.value)}
            onKeyDown={(e) => {
              handleSearchChange(e);
            }}
            className="menu_search searchButton"
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

        {projectsLoaded ? (
          <div className="project-item-div">
            <AddProject />
          </div>
        ) : (
          <div>"Loading Projects..."</div>
        )}
      </>
    );
  };

  // adds individual projects after API call
  const AddProject = () => {
    //const thumbnailPath = "https://raw.githubusercontent.com/"+node.full_name+"/master/project.svg?sanitize=true"
    return nodes.map((node) => (
      <Link
        key={node.id}
        to={
          node.owner.login == globalvariables.currentUser
            ? `/${node.id}`
            : `/run/${node.id}`
        }
        className="product__item"
      >
        <div
          className="project"
          key={node.id}
          id={node.name}
          onClick={() => {
            GlobalVariables.currentRepo = node;
          }}
        >
          <p
            style={{
              fontSize: "1em",
              textOverflow: "ellipsis",
              display: "block",
              overflow: "hidden",
              width: "80%",
            }}
          >
            {node.name}
          </p>
          <img className="project_image" src="/imgs/defaultThumbnail.svg"></img>
          <div style={{ display: "inline" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "scale(.7)" }}
              width="16"
              height="16"
            >
              <path d="M8 .2l4.9 15.2L0 6h16L3.1 15.4z" />
            </svg>
            <p style={{ fontSize: ".5em" }}>{node.stargazers_count}</p>
          </div>
        </div>
      </Link>
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
            src="/imgs/abundance.svg"
            alt="logo"
            style={{ height: "20px", padding: "10px" }}
          />
          {!props.isloggedIn ? (
            <>
              <button
                className="form browseButton githubSign"
                id="loginButton2"
                onClick={props.tryLogin}
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
            </>
          ) : null}
        </div>
      </div>
      {exportPopUp ? (
        <NewProjectPopUp
          setExportPopUp={setExportPopUp}
          authorizedUserOcto={authorizedUserOcto}
          exporting={false}
        />
      ) : (
        <ClassicBrowse />
      )}
    </>
  );
};

function LoginMode(props) {
  /*
   * @prop {object} authorizedUserOcto - authorized octokit instance
   * @prop {setState} setIsLoggedIn - setState function for isloggedIn
   * @prop {boolean} isloggedIn - Boolean that determines if user is logged in
   * */
  const [userBrowsing, setBrowsing] = useState(false);
  const exportPopUp = props.exportPopUp;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;

  var currentUser = GlobalVariables.currentUser;

  let popUpContent;
  if (props.authorizedUserOcto && !userBrowsing) {
    popUpContent = (
      <ShowProjects
        user={currentUser}
        authorizedUserOcto={authorizedUserOcto}
        userBrowsing={userBrowsing}
        setBrowsing={setBrowsing}
        isloggedIn={props.isloggedIn}
        exportPopUp={exportPopUp}
        setExportPopUp={setExportPopUp}
      />
    );
  } else if (userBrowsing) {
    popUpContent = (
      <ShowProjects
        user={""}
        userBrowsing={userBrowsing}
        authorizedUserOcto={authorizedUserOcto}
        setBrowsing={setBrowsing}
        isloggedIn={props.isloggedIn}
        tryLogin={props.tryLogin}
      />
    );
  } else {
    popUpContent = (
      <InitialLog tryLogin={props.tryLogin} setBrowsing={setBrowsing} />
    );
  }
  return (
    <div
      className="login-popup"
      id="projects-popup"
      style={{
        padding: "0",
        border: "10px solid #3e3d3d",
      }}
    >
      <div>
        {" "}
        {GlobalVariables.currentRepo ? (
          <Link to={`/${GlobalVariables.currentRepo.id}`}>
            <button className="closeButton">
              <img></img>
            </button>
          </Link>
        ) : null}
      </div>
      {popUpContent}
    </div>
  );
}

export default LoginMode;

/*--Credit to https://codepen.io/colorlib/pen/rxddKy */
