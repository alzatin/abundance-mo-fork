import React, { useEffect, useState } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { Link } from "react-router-dom";
import globalvariables from "../../js/globalvariables.js";
import NewProjectPopUp from "../secondary/NewProjectPopUp.jsx";
import { re } from "mathjs";

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
          <img className="logo" src="/imgs/abundance_logo.png" alt="logo" />
          <div id="welcome">
            <img
              src="/imgs/abundance_lettering.png"
              alt="logo"
              style={{ width: "300px" }}
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

// adds individual projects after API call
const AddProject = (props) => {
  const authorizedUserOcto = props.authorizedUserOcto;
  const [browseType, setBrowseType] = useState("thumb");
  const [orderType, setOrderType] = useState("byDateCreated");
  let searchBarValue = props.searchBarValue;
  let nodes = props.nodes;
  //filter nodes by search bar value
  /* if (searchBarValue != "") {
    nodes = nodes.filter((node) => {
      return node.name.toLowerCase().includes(searchBarValue.toLowerCase());
    });
  }*/

  return (
    <>
      <div
        style={{
          flexDirection: "row",
          height: "30px",
          widht: "50%",
          margin: "-25px 0 10px 20px",
          display: "flex",
        }}
      >
        <button
          className="list_thumb_button"
          key="list-filter-button"
          onClick={() => setBrowseType("list")}
        >
          <img
            src="/imgs/list.svg"
            alt="list_search"
            style={{
              width: "20px",
              marginRight: "5px",
              opacity: "0.8",
            }}
          />
        </button>
        <button
          className="list_thumb_button"
          key="thumb-filter-button"
          onClick={() => setBrowseType("thumb")}
        >
          <img
            src="/imgs/thumbnail.svg"
            alt="thumb_search"
            style={{
              width: "20px",
              marginRight: "5px",
              opacity: "0.8",
            }}
          />
        </button>
        <label htmlFor="order-by">
          <img src="/imgs/sort.svg" alt="Sort by" style={{ width: "15px" }} />
          <select
            className="order_dropdown"
            id="order-by"
            defaultValue={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option key={"name_order"} value={"byName"}>
              Name
            </option>
            <option key={"forks_order"} value={"byForks"}>
              Forks
            </option>
            <option key={"stars_order"} value={"byStars"}>
              Stars
            </option>
            <option key={"owner_order"} value={"byOwnerName"}>
              Creator
            </option>
            <option key={"date_order"} value={"byDateCreated"}>
              Date Created
            </option>
          </select>
        </label>
      </div>
      {nodes.length > 0 ? (
        <ProjectDiv
          browseType={browseType}
          authorizedUserOcto={authorizedUserOcto}
          nodes={nodes}
          orderType={orderType}
        />
      ) : (
        <p>No projects match your search</p>
      )}
    </>
  );
};

const ProjectDiv = (props) => {
  const nodes = props.nodes;
  const browseType = props.browseType;
  const orderType = props.orderType;

  const ThumbItem = ({ node }) => {
    return (
      <div
        className="project"
        style={
          node.owner != GlobalVariables.currentUser
            ? { backgroundColor: "rgb(233 221 242 / 58%)" }
            : null
        }
        key={node.topMoleculeID + node.owner}
        id={node.repoName}
        onClick={() => {
          GlobalVariables.currentRepo = node;
        }}
      >
        {node.topics.includes("abundance-tool") ? (
          <h2
            style={{
              float: "right",
              position: "relative",
              top: "-10px",
              padding: "0",
            }}
          >
            {" "}
            {"\u{1F528} "}{" "}
          </h2>
        ) : null}
        <p
          style={{
            fontSize: "1em",
            textOverflow: "ellipsis",
            display: "block",
            overflow: "hidden",
            width: "80%",
          }}
        >
          {node.repoName}
        </p>
        <img
          className="project_image"
          src={node.svgURL}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = "/imgs/defaultThumbnail.svg";
          }}
          alt={node.repoName}
        ></img>
        <div style={{ display: "inline" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "scale(.7)" }}
            width="16"
            height="16"
          >
            <path d="M8 .2l4.9 15.2L0 6h16L3.1 15.4z" />
          </svg>
          <p style={{ fontSize: ".7em", display: "inline" }}>{node.ranking}</p>
        </div>
      </div>
    );
  };
  const ListItem = (node) => {
    return (
      <div
        className="project_list"
        key={node.node.id}
        id={node.node.id}
        onClick={() => {
          GlobalVariables.currentRepo = node.node;
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
          {node.node.repoName}
        </p>

        <p
          style={{
            fontSize: "1em",
            textOverflow: "ellipsis",
            display: "block",
            overflow: "hidden",
            width: "50%",
          }}
        >
          {node.node.owner}
        </p>
        <h2 style={{ width: "20%", display: "block" }}>
          {" "}
          {node.node.topics && node.node.topics.includes("abundance-tool")
            ? "\u{1F528} "
            : null}
        </h2>
        <p
          style={{
            fontSize: "1em",
            textOverflow: "ellipsis",
            display: "block",
            overflow: "hidden",
            width: "70%",
          }}
        >
          {node.node.forks}
        </p>

        <p
          style={{
            fontSize: "1em",
            textOverflow: "ellipsis",
            display: "block",
            overflow: "hidden",
            width: "80%",
          }}
        >
          {node.node.dateCreated}
        </p>

        <div style={{ width: "10%", display: "flex", flexDirection: "row" }}>
          <p style={{ fontSize: "1em" }}>{node.node.ranking}</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "scale(1)" }}
            width="16"
            height="16"
          >
            <path d="M8 .2l4.9 15.2L0 6h16L3.1 15.4z" />
          </svg>
        </div>
      </div>
    );
  };

  var sorters = {
    byName: function (a, b) {
      return a.repoName < b.repoName ? -1 : a.repoName > b.repoName ? 1 : 0;
    },
    byForks: function (a, b) {
      return b.forks - a.forks;
    },
    byStars: function (a, b) {
      return b.ranking - a.ranking;
    },
    byOwnerName: function (a, b) {
      return a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0;
    },
    byDateCreated: function (a, b) {
      return new Date(a.dateCreated) > new Date(b.dateCreated)
        ? -1
        : new Date(a.dateCreated) < new Date(b.dateCreated)
        ? 1
        : 0;
    },
  };
  const dummyNode = {
    forks: "Forks",
    ranking: "#",
    dateCreated: "Date Created",
    owner: "Creator",
    repoName: "Name",
  };

  return (
    <>
      <div className="project-item-div">
        {browseType == "list" ? <ListItem node={dummyNode} /> : null}
        {nodes.sort(sorters[orderType]).map((node) => (
          <Link
            key={node.owner + node.repoName}
            to={
              node.owner == globalvariables.currentUser
                ? `/${node.owner}/${node.repoName}`
                : `/run/${node.owner}/${node.repoName}`
            }
          >
            {browseType == "list" ? (
              <ListItem node={node} />
            ) : (
              <ThumbItem node={node} />
            )}
          </Link>
        ))}
      </div>
    </>
  );
};

/* to add: if current user is null show this next part */
const ShowProjects = (props) => {
  const [projectsLoaded, setStateLoaded] = useState([]);
  const [lastKey, setLastKey] = useState("");
  let pageDict = props.pageDict;
  const [pageNumber, setPageNumber] = useState(0);

  const [searchBarValue, setSearchBarValue] = useState("");
  const exportPopUp = props.exportPopUp;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;

  useEffect(() => {
    octokit = new Octokit();
    var query;

    const forkDummyProject = async function (authorizedUserOcto) {
      var owner = "alzatin";
      var repo = "My-first-Abundance-project";
      // if authenticated and it is not your project, make a clone of the project and return to create mode
      authorizedUserOcto
        .request("GET /repos/{owner}/{repo}", {
          owner: owner,
          repo: repo,
        })
        .then((result) => {
          authorizedUserOcto.rest.repos
            .createFork({
              owner: owner,
              repo: repo,
            })
            .then(() => {
              var activeUser = GlobalVariables.currentUser;
              // return to create mode
              authorizedUserOcto
                .request("GET /repos/{owner}/{repo}", {
                  owner: activeUser,
                  repo: repo,
                })
                .then((result) => {
                  GlobalVariables.currentRepo = result.data;

                  authorizedUserOcto.rest.repos.replaceAllTopics({
                    owner: activeUser,
                    repo: GlobalVariables.currentRepo.repoName,
                    names: ["abundance-project"],
                  });
                });
            });
        });
    };
    const repoSearchRequest = async () => {
      pageDict[pageNumber] = lastKey;
      let lastKeyQuery = lastKey
        ? "&lastKey=" + lastKey.repoName + "~" + lastKey.owner
        : "&lastKey";
      let searchQuery;
      if (searchBarValue != "") {
        searchQuery = "&query=" + searchBarValue;
      } else {
        searchQuery = "&query";
      }
      if (props.user == "" || props.userBrowsing) {
        query = "attribute=repoName" + searchQuery + "&user" + lastKeyQuery;
      } else {
        query =
          "attribute=repoName" +
          searchQuery +
          "&user=" +
          props.user +
          lastKeyQuery;
      }

      const scanApiUrl =
        "https://hg5gsgv9te.execute-api.us-east-2.amazonaws.com/abundance-stage/scan-search-abundance?" +
        query;

      let awsRepos = await fetch(scanApiUrl);

      //populateUserAWS();
      //populateAWS(repos[0].data); // can only handle 20 items at a time

      return awsRepos.json();
    };

    repoSearchRequest()
      .then((result) => {
        console.log(result);
        if (result["repos"].length == 0 && props.user !== "") {
          forkDummyProject(authorizedUserOcto).then(() => {
            repoSearchRequest().then((result) => {
              props.setBrowsing(true);
              setStateLoaded(result["repos"]);
            });
          });
        } else {
          setStateLoaded(result["repos"]);
          setLastKey(result["lastKey"]);
        }
      })
      .catch((err) => {
        window.alert(
          "Error loading projects. Please wait a few minutes then try again."
        );
      });
  }, [props.user, searchBarValue, pageNumber]);

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
            src="/imgs/abundance_logo.png"
            alt="logo"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
          <img
            src="/imgs/abundance_lettering.png"
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
        <>
          <ClassicBrowse
            projectsLoaded={projectsLoaded}
            setStateLoaded={setStateLoaded}
            setPageNumber={setPageNumber}
            pageNumber={pageNumber}
            authorizedUserOcto={authorizedUserOcto}
            lastKey={lastKey}
            setSearchBarValue={setSearchBarValue}
            searchBarValue={searchBarValue}
            setExportPopUp={setExportPopUp}
            user={props.user}
            pageDict={pageDict}
            userBrowsing={props.userBrowsing}
            setBrowsing={props.setBrowsing}
            isloggedIn={props.isloggedIn}
          />
        </>
      )}
    </>
  );
};

// Browse display
const ClassicBrowse = (props) => {
  let nodes = [];
  const setPageNumber = props.setPageNumber;
  const pageNumber = props.pageNumber;
  const projectsLoaded = props.projectsLoaded;
  const setStateLoaded = props.setProjectsLoaded;
  let pageDict = props.pageDict;
  const searchBarValue = props.searchBarValue;
  const setSearchBarValue = props.setSearchBarValue;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;
  const lastKey = props.lastKey;

  if (projectsLoaded.length > 0) {
    var userRepos = [];
    projectsLoaded /*[pageNumber].data.*/
      .forEach((repo) => {
        userRepos.push(repo);
      });
    nodes = [...userRepos];
  }

  const loadBrowse = () => {
    props.setBrowsing(!props.userBrowsing);
    setPageNumber(0);
  };
  const handleSearchChange = (e) => {
    if (e.code == "Enter") {
      setSearchBarValue(e.target.value);
      setPageNumber(0);
    }
  };

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
        {projectsLoaded.length > 1 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              margin: "0px 10px 0px 10px",
            }}
          >
            <button
              onClick={() => {
                if (pageNumber > 0) {
                  setPageNumber(pageNumber - 1);
                }
              }}
              className="page_back_button"
            >
              {"\u2190"}
            </button>
            <p
              style={{ alignSelf: "center", fontSize: ".7em", padding: "3px" }}
            ></p>
            <button
              className="page_forward_button"
              onClick={() => {
                if (lastKey != "") {
                  setPageNumber(pageNumber + 1);
                }
              }}
            >
              {"\u2192"}
            </button>
          </div>
        ) : null}
        <input
          type="text"
          key="project-search-bar"
          placeholder={searchBarValue}
          //value={target.value}
          //onChange={(e) => setSearchBarType(e.target.value)}
          onKeyDown={(e) => {
            handleSearchChange(e);
          }}
          className="menu_search searchButton"
          id="project_search"
        />
        <button className="list_thumb_button">
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
        </button>
      </div>
      {projectsLoaded.length > 0 ? (
        <AddProject
          searchBarValue={searchBarValue}
          authorizedUserOcto={authorizedUserOcto}
          user={props.user}
          userBrowsing={props.userBrowsing}
          nodes={nodes}
        />
      ) : (
        <p> Loading...</p>
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
  const pageDict = { 0: null };

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
        pageDict={pageDict}
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
        exportPopUp={exportPopUp}
        setExportPopUp={setExportPopUp}
        pageDict={pageDict}
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
            <button
              className="closeButton"
              onClick={() => {
                setExportPopUp(false);
              }}
            >
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
