import Molecule from "../molecules/molecule";
import GlobalVariables from "../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

/**
 * This class creates the GitHubMolecule atom.
 */
export default class GitHubMolecule extends Molecule {
  /**
   * The constructor function.
   * @param {object} values An array of values passed in which will be assigned to the class as this.x
   */
  constructor(values) {
    super(values);

    /**
     * This atom's name
     * @type {string}
     */
    this.name = "Github Molecule";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "GitHubMolecule";
    /**
     * A flag to signal if this node is the top level node
     * @type {boolean}
     */
    this.topLevel = false;
    /**
     * The color for the whole in the center of the drawing...probably doesn't need to be in this scope
     * @type {string}
     */
    this.centerColor = "black";
    /**
     * A description of this atom
     * @type {string}
     */
    this.description = "Project imported from GitHub";

    this.setValues(values);
  }

  /**
     * This replaces the default Molecule double click behavior to prevent you from being able to double click into a github molecule
     * @param {number} x - The x coordinate of the click
     * @param {number} y - The y coordinate of the click
     // */
  doubleClick(x, y) {
    var clickProcessed = false;
    var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y);
    if (distFromClick < this.radius) {
      clickProcessed = true;
    }
    return clickProcessed;
  }
  /**
   * Loads a project into this GitHub molecule from github based on the passed github ID. This function is async and execution time depends on project complexity, and network speed.
   * @param {number} id - The GitHub project ID for the project to be loaded.
   */
  async loadProjectByID(id) {
    let octokit = new Octokit();
    await octokit
      .request("GET /repositories/:id/contents/project.maslowcreate", { id })
      .then((response) => {
        //content will be base64 encoded
        let valuesToOverwriteInLoadedVersion = {};
        if (this.topLevel) {
          //If we are loading this as a stand alone project
          valuesToOverwriteInLoadedVersion = {
            atomType: this.atomType,
            topLevel: this.topLevel,
          };
        } else {
          //If there are stored io values to recover
          if (this.ioValues != undefined) {
            valuesToOverwriteInLoadedVersion = {
              uniqueID: this.uniqueID,
              x: this.x,
              y: this.y,
              atomType: this.atomType,
              topLevel: this.topLevel,
              ioValues: this.ioValues,
            };
          } else {
            valuesToOverwriteInLoadedVersion = {
              uniqueID: this.uniqueID,
              x: this.x,
              y: this.y,
              atomType: this.atomType,
              topLevel: this.topLevel,
            };
          }
        }

        let rawFile = JSON.parse(atob(response.data.content));
        this.deserialize(rawFile, valuesToOverwriteInLoadedVersion, true).then(
          () => {
            this.setValues(valuesToOverwriteInLoadedVersion);
          }
        );

        return rawFile;
      });
  }

  /**
   * Reload this github molecule from github
   */
  reloadMolecule() {
    var outputConnector = false;
    if (this.output.connectors.length > 0) {
      outputConnector = this.output.connectors[0];
    }

    //Delete everything currently inside...Make a copy to prevent index issues
    const copyOfNodesOnTheScreen = [...this.nodesOnTheScreen];
    copyOfNodesOnTheScreen.forEach((node) => {
      node.deleteNode(false, false, true);
    });

    //Re-de-serialize this molecule
    this.loadProjectByID(this.projectID).then(() => {
      if (outputConnector) {
        //Reconnect the output connector
        outputConnector.attachmentPoint1 = this.output;
        this.output.connectors.push(outputConnector);
      }

      this.beginPropagation(true);
    });
  }

  /**
   * Save the project information to be loaded. This should use super.serialize() to maintain a connection with Molecule, but it doesn't...should be fixed
   */
  serialize() {
    var ioValues = [];
    this.inputs.forEach((io) => {
      if (typeof io.getValue() == "number") {
        var saveIO = {
          name: io.name,
          ioValue: io.getValue(),
        };
        ioValues.push(saveIO);
      }
    });

    //Return a placeholder for this molecule
    var object = {
      atomType: this.atomType,
      name: this.name,
      x: this.x,
      y: this.y,
      uniqueID: this.uniqueID,
      projectID: this.projectID,
      ioValues: ioValues,
      simplify: this.simplify,
    };

    return object;
  }
}
