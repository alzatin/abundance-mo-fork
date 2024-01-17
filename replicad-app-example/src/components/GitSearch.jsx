import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { re } from "mathjs";

function GitSearch(props) {
  let searchBarValue = "";
  var [gitRepos, setGitRepos] = useState([]);
  var [loadingGit, setLoadingGit] = useState(false);

  /**
   * Runs when a menu option is clicked to place a new atom from searching on GitHub.
   * @param {object} ev - The event triggered by clicking on a menu item.
   */
  function placeGitHubMolecule(e, item) {
    GlobalVariables.currentMolecule.placeAtom(
      {
        x: GlobalVariables.pixelsToWidth(GlobalVariables.lastClick[0]),
        y: GlobalVariables.pixelsToHeight(GlobalVariables.lastClick[1]),
        parent: GlobalVariables.currentMolecule,
        atomType: "GitHubMolecule",
        projectID: item.id,
        uniqueID: GlobalVariables.generateUniqueID(),
      },
      true
    );
    props.setSearchingGitHub(false);
    setGitRepos([]);
  }
  // conditional query for maslow projects
  const searchGitHub = function () {
    var query = searchBarValue + " topic:maslowcreate";
    let octokit = new Octokit();
    octokit
      .request("GET /search/repositories", {
        q: query,
        per_page: 50,
        headers: {
          accept: "application/vnd.github.mercy-preview+json",
        },
      })
      .then((result) => {
        let resultingRepos = [];
        result.data.items.forEach((repo) => {
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

  const [isHovering, setIsHovering] = useState(false);
  const [panelItem, setPanelItem] = useState({});

  const handleMouseOver = (item, key) => {
    console.log(item.name);
    console.log(key);
    setPanelItem(item);
  };
  const handleMouseOut = () => {
    setPanelItem({});
  };

  const GitList = function () {
    return gitRepos.map((item, key) => {
      return (
        <>
          <li
            onClick={(e) => placeGitHubMolecule(e, item)}
            key={key}
            onMouseEnter={() => handleMouseOver(item, key)}
            onMouseLeave={() => handleMouseOut()}
          >
            {item.name}
          </li>
        </>
      );
    });
  };

  return (
    <>
      {props.searchingGitHub ? (
        <div
          id="git_search"
          style={{
            top: GlobalVariables.lastClick[1] + "px",
            left: GlobalVariables.lastClick[0] + "px",
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
          <div className="GitProjectInfoPanel">{panelItem.name}</div>
        </div>
      ) : null}
    </>
  );
}

export default GitSearch;
