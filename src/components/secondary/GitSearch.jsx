import React, { useState, useRef } from "react";
import GlobalVariables from "../../js/globalvariables.js";
import topics from "../../js/maslowTopics.js";

function GitSearch({ searchingGitHub, setSearchingGitHub }) {
  let searchBarValue = "";
  var [gitRepos, setGitRepos] = useState([]);
  var [loadingGit, setLoadingGit] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const [yearShow, setYearShow] = useState("2024");
  const [isHovering, setIsHovering] = useState(false);
  const [panelItem, setPanelItem] = useState({});
  const maslowTopic = useRef(null);

  /**
   * Runs when a menu option is clicked to place a new atom from searching on GitHub.
   * @param {object} ev - The event triggered by clicking on a menu item.
   */
  function placeGitHubMolecule(e, item) {
    GlobalVariables.currentMolecule.loadGithubMoleculeByName(item);
    setSearchingGitHub(false);
    setIsHovering(false);
    setGitRepos([]);
    setIsHovering(false);
  }
  // conditional query for maslow projects
  const searchGitHub = function () {
    const repoSearchRequest = async () => {
      let lastKeyQuery = lastKey
        ? "&lastKey=" + lastKey.repoName + "~" + lastKey.owner
        : "&lastKey";

      let searchQuery;
      if (searchBarValue != "") {
        searchQuery = "&query=" + searchBarValue + "&yearShow=" + yearShow;
      } else {
        searchQuery = "&query" + "&yearShow=" + yearShow;
      }
      // gitsearch searches by repoName and does not specify user, we could specify last key if we wanted to paginate

      let query =
        "attribute=searchField" + searchQuery + "&user" + lastKeyQuery;
      const scanApiUrl =
        "https://hg5gsgv9te.execute-api.us-east-2.amazonaws.com/abundance-stage/scan-search-abundance?" +
        query;

      let awsRepos = await fetch(scanApiUrl);

      return awsRepos.json();
    };
    repoSearchRequest().then((result) => {
      let resultingRepos = [];
      result["repos"].forEach((repo) => {
        resultingRepos.push(repo);
      });
      setGitRepos(resultingRepos);
      setLoadingGit(false);
    });
  };

  const handleKeyDown = function (e) {
    if (e.key === "Enter") {
      setLoadingGit(true);
      searchGitHub();
    }
  };
  const handleChange = function (e) {
    searchBarValue = e.target.value;
  };

  const handleMouseOver = (item, key) => {
    console.log(item);
    setPanelItem(item);
    setIsHovering(true);
  };
  const handleMouseOut = () => {
    setPanelItem({});
    setIsHovering(false);
  };

  const GitList = function () {
    return gitRepos.map((item, key) => {
      return (
        <li
          onClick={(e) => placeGitHubMolecule(e, item)}
          key={item.id}
          onMouseEnter={() => handleMouseOver(item, key)}
          onMouseLeave={() => handleMouseOut()}
        >
          {item.repoName}
        </li>
      );
    });
  };

  return (
    <>
      {searchingGitHub ? (
        <div className="search-container">
          <div
            id="git_search"
            style={{
              top: GlobalVariables.lastClick
                ? GlobalVariables.lastClick[1] + "px"
                : "25%",
              left: GlobalVariables.lastClick
                ? GlobalVariables.lastClick[0] + "px"
                : "50%",
            }}
          >
            <input
              type="text"
              id="menuInput"
              //onBlur="value=''"
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              placeholder="Search for atom.."
              className="menu_search_canvas"
            ></input>

            <GitList />
          </div>
          {isHovering ? (
            <div
              className="GitProjectInfoPanel"
              style={{
                top: GlobalVariables.lastClick[1] - 50 + "px",
                left: GlobalVariables.lastClick[0] - 375 + "px",
              }}
            >
              <div className="GitInfoLeft">
                <img src={panelItem.svgURL}></img>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: "scale(.7)" }}
                    width="16"
                    height="16"
                  >
                    <path d="M8 .2l4.9 15.2L0 6h16L3.1 15.4z" />
                  </svg>
                  <p style={{ fontSize: "0.5em" }}>{panelItem.ranking}</p>
                </div>
              </div>

              <div className="GitInfo">
                <div>
                  <strong>Project Name: </strong>
                  <span>{panelItem.repoName}</span>
                </div>
                <div>
                  <strong>Creator: </strong>
                  <span>{panelItem.owner}</span>
                </div>
                <div>
                  <strong>Description: </strong>
                  <span>{panelItem.description || null}</span>
                </div>
                <div>
                  <strong>Topics: </strong>
                  <span>{panelItem.topics}</span>
                </div>
                <div>
                  <strong>Created: </strong>
                  <span>{panelItem.dateCreated}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default GitSearch;
