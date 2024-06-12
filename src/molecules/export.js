import Atom from "../prototypes/atom.js";
import GlobalVariables from "../js/globalvariables.js";
import { button, LevaInputs } from "leva";
import { Octokit } from "https://esm.sh/octokit@2.0.19";

/**
 * This class creates an atom which supports uploading a .svg file
 */
export default class Export extends Atom {
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
    this.name = "Export";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Export";
    /**
     * A description of this atom
     * @type {string}
     */
    this.description =
      "Export Atom, let's you choose a type of file to Export.";
    /**
     * This atom's value. Contains the value of the input geometry, not the stl
     * @type {string}
     */
    this.value = null;
    /**
     * The type of file to export
     * @type {string}
     */
    this.type = null;

    this.addIO("input", "geometry", this, "geometry", "");

    this.setValues(values);
  }

  /**
   * Draw the circle atom & icon.
   */
  draw() {
    super.draw(); //Super call to draw the rest

    GlobalVariables.c.beginPath();
    GlobalVariables.c.fillStyle = "#484848";
    GlobalVariables.c.font = `${GlobalVariables.widthToPixels(
      this.radius
    )}px Work Sans Bold`;
    GlobalVariables.c.fillText(
      "G",
      GlobalVariables.widthToPixels(this.x - this.radius / 3),
      GlobalVariables.heightToPixels(this.y) + this.height / 3
    );
    GlobalVariables.c.fill();
    GlobalVariables.c.closePath();
  }

  /**
   * Update the displayed svg file
   */
  updateValue() {
    try {
      let inputID = this.findIOValue("geometry");
      let fileType = this.type;

      let funcToCall =
        fileType == "STL"
          ? GlobalVariables.cad.getSTL
          : fileType == "SVG"
          ? GlobalVariables.cad.getSVG
          : fileType == "STEP"
          ? GlobalVariables.cad.getSTEP
          : null;

      if (funcToCall == null) {
        throw "Invalid file type";
      }
      funcToCall(this.uniqueID, inputID).then((result) => {
        this.basicThreadValueProcessing();
        //this.sendToRender();
      });
    } catch (err) {
      this.setAlert(err);
    }
  }

  createLevaInputs() {
    let inputParams = {};

    const importOptions = ["STL", "SVG", "STEP"];
    let importIndex = 0;

    inputParams[this.uniqueID + "file_ops"] = {
      options: importOptions,
      label: "File Type",
      onChange: (value) => {
        importIndex = importOptions.indexOf(value);
        this.type = importOptions[importIndex];
        console.log("file type is now " + this.type);
        this.updateValue();
      },
    };
    inputParams["Download File"] = button(() =>
      //this.loadFile(importOptions[importIndex])
      this.exportFile()
    );

    return inputParams;
  }

  /**
   * The function which is called when you press the download button.
   */
  exportFile() {
    try {
      let inputID = this.findIOValue("geometry");

      GlobalVariables.cad.downSVG(this.uniqueID, inputID).then((result) => {
        var blob = new Blob([result], { type: "image/svg+xml;charset=utf-8" });
        saveAs(blob, GlobalVariables.currentMolecule.name + ".svg");
      });
    } catch (err) {
      this.setAlert(err);
    }
  }
}
