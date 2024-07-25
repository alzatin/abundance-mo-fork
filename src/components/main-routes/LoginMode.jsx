import React, { useEffect, useState } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { Link } from "react-router-dom";
import globalvariables from "../../js/globalvariables.js";
import NewProjectPopUp from "../secondary/NewProjectPopUp.jsx";
import {
  paginateRest,
  composePaginateRest,
} from "@octokit/plugin-paginate-rest";

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
  const [browseType, setBrowseType] = useState("thumb");
  const [orderType, setOrderType] = useState("Name");
  let searchBarValue = props.searchBarValue;
  console.log("searchBarValue: " + searchBarValue);
  let nodes = props.nodes;

  //filter nodes by search bar value
  if (searchBarValue != "") {
    nodes = nodes.filter((node) => {
      return node.name.toLowerCase().includes(searchBarValue.toLowerCase());
    });
  }

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
      <ProjectDiv browseType={browseType} nodes={nodes} orderType={orderType} />
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
        <img
          className="project_image"
          src={
            "https://raw.githubusercontent.com/" +
            node.full_name +
            "/master/project.svg?sanitize=true"
          }
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = "/imgs/defaultThumbnail.svg";
          }}
          alt={node.name}
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
          <p style={{ fontSize: ".7em", display: "inline" }}>
            {node.stargazers_count}
          </p>
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
          {node.node.name}
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
          {node.node.owner.login}
        </p>
        <p
          style={{
            fontSize: "1em",
            textOverflow: "ellipsis",
            display: "block",
            overflow: "hidden",
            width: "70%",
          }}
        >
          {node.node.forks_count}
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
          {node.node.created_at}
        </p>
        <div style={{ width: "10%", display: "flex", flexDirection: "row" }}>
          <p style={{ fontSize: "1em" }}>{node.node.stargazers_count}</p>
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
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    },
    byForks: function (a, b) {
      return b.forks_count - a.forks_count;
    },
    byStars: function (a, b) {
      return b.stargazers_count - a.stargazers_count;
    },
    byOwnerName: function (a, b) {
      return a.owner.login < b.owner.login
        ? -1
        : a.owner.login > b.owner.login
        ? 1
        : 0;
    },
    byDateCreated: function (a, b) {
      return new Date(a.created_at) > new Date(b.created_at)
        ? -1
        : new Date(a.created_at) < new Date(b.created_at)
        ? 1
        : 0;
    },
  };
  const dummyNode = {
    forks_count: "Forks",
    stargazers_count: "#",
    created_at: "Date Created",
    owner: { login: "Creator" },
    name: "Name",
  };

  return (
    <>
      <div className="project-item-div">
        {browseType == "list" ? <ListItem node={dummyNode} /> : null}
        {nodes.sort(sorters[orderType]).map((node) => (
          <Link
            key={node.id}
            to={
              node.owner.login == globalvariables.currentUser
                ? `/${node.id}`
                : `/run/${node.id}`
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
  //const [projectsLoaded, setStateLoaded] = useState(false);
  const [searchBarValue, setSearchBarValue] = useState("");
  const exportPopUp = props.exportPopUp;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;

  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    octokit = new Octokit();
    var query;
    if (props.user == "" || props.userBrowsing) {
      query = " topic:abundance-project" + " fork:true";
    } else {
      query = " user:" + props.user + " topic:abundance-project" + " fork:true";
    }

    octokit
      .paginate("GET /search/repositories", {
        q: query,
      })
      .then((result) => {
        console.log(result);
        var userRepos = [];
        result.forEach((repo) => {
          userRepos.push(repo);
        });
        setNodes([...userRepos]);
        //setStateLoaded(true);
      })
      .catch((err) => {
        window.alert(
          "Error loading projects. Please wait a few minutes then try again."
        );
      });
  }, []);

  // Browse display
  const ClassicBrowse = () => {
    const loadBrowse = () => {
      props.setBrowsing(!props.userBrowsing);
      //setStateLoaded(true);
    };
    const handleSearchChange = (e) => {
      if (e.code == "Enter") {
        setSearchBarValue(e.target.value);
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

        <AddProject
          searchBarValue={searchBarValue}
          user={props.user}
          userBrowsing={props.userBrowsing}
          nodes={nodes}
        />
      </>
    );
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
