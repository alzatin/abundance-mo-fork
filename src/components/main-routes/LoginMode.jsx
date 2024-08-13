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
  const [browseType, setBrowseType] = useState("thumb");
  const [orderType, setOrderType] = useState("byDateCreated");
  let searchBarValue = props.searchBarValue;
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
          node.owner.login != GlobalVariables.currentUser
            ? { backgroundColor: "rgb(233 221 242 / 58%)" }
            : null
        }
        key={node.id + node.owner.login}
        id={node.name}
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
    console.log(node);
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
            width: "50%",
          }}
        >
          {node.node.owner.login}
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
  const [projectsLoaded, setStateLoaded] = useState([]);

  const [searchBarValue, setSearchBarValue] = useState("");
  const exportPopUp = props.exportPopUp;
  const setExportPopUp = props.setExportPopUp;
  const authorizedUserOcto = props.authorizedUserOcto;

  useEffect(() => {
    octokit = new Octokit();
    var query;
    if (props.user == "" || props.userBrowsing) {
      query = searchBarValue + " topic:abundance-project" + " fork:true";
    } else {
      query =
        searchBarValue +
        " user:" +
        props.user +
        " topic:abundance-project" +
        " fork:true";
    }
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
                    repo: GlobalVariables.currentRepo.name,
                    names: ["abundance-project"],
                  });
                });
            });
        });
    };
    const repoSearchRequest = async () => {
      let repoCount = 0;

      /*const repos = await octokit.paginate(
        "GET /search/repositories",
        {
          q: query,
          per_page: 50,
        },
        (response, done) => {
          repoCount += response.data.length;
          if (repoCount >= 250) {
            done();
          }
          return response;
        }
      );*/
      const scanApiUrl =
        "https://hg5gsgv9te.execute-api.us-east-2.amazonaws.com/abundance-stage/scan-search-abundance?attribute=repoName&query=aws_2";

      let awsRepos = await fetch(scanApiUrl);
      console.log(awsRepos.json());
      //return repos.json();

      //populateAWS(repos[0].data); // can only handle 20 items at a time

      //return repos;
    };
    /*initialize the AWS database with the projects from the search- don't need anymore but will leave for ref*/
    const populateAWS = async (repos) => {
      console.log(repos);
      let repoArray = [];

      // getReadMeContent
      //let readMeContent

      repos.forEach((result) => {
        repoArray.push({
          owner: result.owner.login,
          repoName: result.name,
          ranking: result.stargazers_count,
          forks: result.forks_count,
          topMoleculeID: result.id,
          topics: result.topics,
          readme:
            "https://raw.githubusercontent.com/" +
            result.full_name +
            "/master/README.md?sanitize=true",
          contentURL:
            "https://raw.githubusercontent.com/" +
            result.full_name +
            "/master/project.abundance?sanitize=true",
          githubMoleculesUsed: [],
          svgURL:
            "https://raw.githubusercontent.com/" +
            result.full_name +
            "/master/project.svg?sanitize=true",
          dateCreated: result.created_at,
        });
      });
      const apiUrl =
        "https://hg5gsgv9te.execute-api.us-east-2.amazonaws.com/abundance-stage//populate-table";
      console.log(repoArray.length);
      fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ repos: repoArray }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }).then((response) => {
        console.log(response);
      });
    };

    repoSearchRequest()
      .then((result) => {
        if (result[0].data.total_count == 0 && props.user !== "") {
          forkDummyProject(authorizedUserOcto).then(() => {
            repoSearchRequest().then((result) => {
              props.setBrowsing(true);
              setStateLoaded(result);
            });
          });
        } else {
          setStateLoaded(result);
        }
      })
      .catch((err) => {
        window.alert(
          "Error loading projects. Please wait a few minutes then try again."
        );
      });
  }, [props.user, searchBarValue]);

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
        <ClassicBrowse
          projectsLoaded={projectsLoaded}
          setSearchBarValue={setSearchBarValue}
          searchBarValue={searchBarValue}
          setExportPopUp={setExportPopUp}
          user={props.user}
          userBrowsing={props.userBrowsing}
          setBrowsing={props.setBrowsing}
          isloggedIn={props.isloggedIn}
        />
      )}
    </>
  );
};

// Browse display
const ClassicBrowse = (props) => {
  let nodes = [];
  const [pageNumber, setPageNumber] = useState(0);
  let projectsLoaded = props.projectsLoaded;
  let searchBarValue = props.searchBarValue;
  let setSearchBarValue = props.setSearchBarValue;
  let setExportPopUp = props.setExportPopUp;

  if (projectsLoaded.length > 0) {
    var userRepos = [];
    projectsLoaded[pageNumber].data.forEach((repo) => {
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
                if (pageNumber + 1 > 1) {
                  setPageNumber(pageNumber - 1);
                }
              }}
              className="page_back_button"
            >
              {"\u2190"}
            </button>
            <p
              style={{ alignSelf: "center", fontSize: ".7em", padding: "3px" }}
            >
              Page {pageNumber + 1} of {projectsLoaded.length}
            </p>
            <button
              className="page_forward_button"
              onClick={() => {
                if (projectsLoaded.length > pageNumber + 1) {
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
        exportPopUp={exportPopUp}
        setExportPopUp={setExportPopUp}
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
