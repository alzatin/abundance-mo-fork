import Molecule from "../molecules/molecule";
import GlobalVariables from "../js/globalvariables.js";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import { button } from "leva";

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
   * Create Leva Menu Input - returns to ParameterEditor
   */
  createLevaInputs() {
    let inputParams = {};

    /** Runs through active atom inputs and adds IO parameters to default param*/
    if (this.inputs) {
      this.inputs.map((input) => {
        const checkConnector = () => {
          return input.connectors.length > 0;
        };

        /* Makes inputs for Io's other than geometry */
        if (input.valueType !== "geometry") {
          inputParams[this.uniqueID + input.name] = {
            value: input.value,
            label: input.name,
            disabled: checkConnector(),
            onChange: (value) => {
              if (input.value !== value) {
                input.setValue(value);
                this.sendToRender();
              }
            },
          };
        }
        inputParams["Reload From Github"] = button(() =>
          console.log("Reload From Github soon")
        );
      });
      return inputParams;
    }
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
}
