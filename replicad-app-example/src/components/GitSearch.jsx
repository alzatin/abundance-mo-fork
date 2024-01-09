import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { re } from "mathjs";

/**
 * Runs when a menu option is clicked to place a new atom from searching on GitHub.
 * @param {object} ev - The event triggered by clicking on a menu item.
 */
function placeGitHubMolecule(e, item) {
  GlobalVariables.currentMolecule.placeAtom(
    {
      x: 200,
      y: 200,
      parent: GlobalVariables.currentMolecule,
      atomType: "GitHubMolecule",
      projectID: item.id,
      uniqueID: GlobalVariables.generateUniqueID(),
    },
    true
  );
}

function GitSearch(props) {
  let searchBarValue = "";
  var [gitRepos, setGitRepos] = useState([]);
  var [loadingGit, setLoadingGit] = useState(false);

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
    console.log(gitRepos);
  };

  const GitList = function () {
    return gitRepos.map((item, key) => {
      return (
        <a href="#" onClick={(e) => placeGitHubMolecule(e, item)}>
          <li key={key}>{item.name}</li>
        </a>
      );
    });
  };

  return (
    <>
      <div id="git_search">
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
    </>
  );
}

export default GitSearch;
