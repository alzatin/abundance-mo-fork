import Atom from "../prototypes/atom.js";
import GlobalVariables from "../js/globalvariables.js";
import { button, LevaInputs } from "leva";

/**
 * This class creates an atom which supports uploading a .svg file
 */
export default class Import extends Atom {
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
    this.name = "Import";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Import";
    /**
     * A description of this atom
     * @type {string}
     */
    this.description =
      "Import Atom, let's you choose a type of file to import and use in your design.";

    /**
     * The name of the uploaded file
     * @type {string}
     */
    this.fileName = "";

    this.addIO("output", "geometry", this, "geometry", "");

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
  updateValue() {}

  createLevaInputs() {
    console.log(LevaInputs);
    let inputParams = {};
    const importOptions = ["STL", "SVG", "STEP"];
    let importIndex = 0;

    inputParams[this.uniqueID + "file_ops"] = {
      options: importOptions,
      label: "File Operations",
      onChange: (value) => {
        importIndex = importOptions.indexOf(value);
      },
    };

    inputParams["Import"] = button(
      () => this.importFile(importOptions[importIndex]),
      { type: "file" }
    );
    return inputParams;
  }

  importFile(type) {
    var f = document.createElement("input");
    f.style.display = "none";
    f.type = "file";
    f.accept = ".jpg";
    f.name = "file";
    f.addEventListener("change", () => {
      console.log("file changed");
      console.log(f.value);
    });
    f.click();
    /*Place holder for import file function*/
  }

  /**
   * The function which is called when you press the upload button
   */
  uploadSvg() {
    var x = document.getElementById("UploadSVG-button");
    if ("files" in x) {
      if (x.files.length > 0) {
        const file = x.files[0];

        const toSend = {};

        //Delete the previous file if this one is a new one
        // if(this.fileName != x.files[0].name){
        //     //Make sure the file to delete actually exists before deleting it
        //     let rawPath = GlobalVariables.gitHub.getAFileRawPath(this.fileName)
        //     var http = new XMLHttpRequest()
        //     http.open('HEAD', rawPath, false)
        //     http.send()
        //     if ( http.status!=404){
        //         toSend[this.fileName] = null
        //     }
        // }

        this.fileName = x.files[0].name;
        this.name = this.fileName;

        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          toSend[this.fileName] = event.target.result;

          GlobalVariables.gitHub.uploadAFile(toSend).then(() => {
            this.updateValue();
            //Save the project to keep it in sync with the files uploaded to github
            setTimeout(() => {
              GlobalVariables.gitHub.saveProject();
            }, 10000);
          });
        });
        reader.readAsText(file);
      }
    }
  }

  /**
   * Add the file name to the object which is saved for this molecule
   */
  serialize() {
    var superSerialObject = super.serialize();

    //Write the current equation to the serialized object
    superSerialObject.fileName = this.fileName; // might delete, maybe we just save as library object
    superSerialObject.name = this.name;

    return superSerialObject;
  }
}
