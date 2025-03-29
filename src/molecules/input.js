import Atom from "../prototypes/atom";
import GlobalVariables from "../js/globalvariables.js";

/**
 * This class creates the input atom.
 */
export default class Input extends Atom {
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
    this.name;
    /**
     * A description of this atom
     * @type {string}
     */
    this.description =
      "Adds an input to the parent molecule. If the parent molecule is the top level of the project then the input will be available when the project is shared or imported into another project. Name is editable";
    /**
     * The value the input is set to, defaults to 10. Is this still used or are we using the value of the attachmentPoint now?
     * @type {number}
     */
    this.value = 10;
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Input";
    /**
     * This atom's height for drawing
     * @type {number}
     */
    this.height;

    this.width;

    this.type = "number";
    /**
     * This atom's old name, used during name changes
     * @type {string}
     */
    this.oldName = this.name;

    this.radius = this.radius * 1.3;

    this.addIO("output", "number or geometry", this, this.type, this.value);

    //Add a new input to the current molecule
    if (typeof this.parent !== "undefined") {
      this.parent.addIO("input", this.name, this.parent, this.type, this.value);
    }

    this.setValues(values);
  }

  /** Solution to canvas overflow https://stackoverflow.com/questions/10508988/html-canvas-text-overflow-ellipsis*/
  fittingString(c, str, maxWidth) {
    var width = c.measureText(str).width;
    var ellipsis = "…";
    var ellipsisWidth = c.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
      return str;
    } else {
      var len = str.length;
      while (width >= maxWidth - ellipsisWidth && len-- > 0) {
        str = str.substring(0, len);
        width = c.measureText(str).width;
      }
      return str + ellipsis;
    }
  }

  /**
   * Draws the atom on the screen.
   */
  draw() {
    // //Snap the inputs to the far right side
    /**
     * The x position of the atom
     * @type {number}
     */
    this.x = 0.04;

    let xInPixels = GlobalVariables.widthToPixels(this.x);
    let yInPixels = GlobalVariables.heightToPixels(this.y);
    let radiusInPixels = GlobalVariables.widthToPixels(this.radius);
    /**
     * Relates height to radius
     * @type {number}
     */
    this.height = radiusInPixels;
    this.width = this.height * 2.5;
    //Check if the name has been updated
    if (this.name != this.oldName) {
      this.updateParentName();
    }

    //Set colors
    if (this.processing) {
      GlobalVariables.c.fillStyle = "blue";
    } else if (this.selected) {
      GlobalVariables.c.fillStyle = this.selectedColor;
      GlobalVariables.c.strokeStyle = this.defaultColor;
      /**
       * This background color
       * @type {string}
       */
      this.color = this.selectedColor;
      /**
       * This atoms accent color
       * @type {string}
       */
      this.strokeColor = this.defaultColor;
    } else {
      GlobalVariables.c.fillStyle = this.defaultColor;
      GlobalVariables.c.strokeStyle = this.selectedColor;
      this.color = this.defaultColor;
      this.strokeColor = this.selectedColor;
    }

    this.inputs.forEach((input) => {
      input.draw();
    });
    if (this.output) {
      this.output.draw();
    }
    GlobalVariables.c.beginPath();
    GlobalVariables.c.moveTo(0, yInPixels + this.height / 2);
    GlobalVariables.c.lineTo(this.width, yInPixels + this.height / 2);
    GlobalVariables.c.lineTo(this.width + radiusInPixels, yInPixels);
    GlobalVariables.c.lineTo(this.width, yInPixels - this.height / 2);
    GlobalVariables.c.lineTo(0, yInPixels - this.height / 2);
    GlobalVariables.c.lineWidth = 1;
    GlobalVariables.c.fill();
    GlobalVariables.c.closePath();
    GlobalVariables.c.stroke();
    GlobalVariables.c.font = "11px Work Sans";
    GlobalVariables.c.textAlign = "start";
    GlobalVariables.c.fillStyle = "black";
    GlobalVariables.c.width = 20;
    GlobalVariables.c.textOverflow = "ellipsis";

    GlobalVariables.c.fillText(
      this.fittingString(GlobalVariables.c, this.name, 50),
      5,
      yInPixels + 3
    );
  }

  /**
   * Remove the input from the parent molecule, then delete the atom normally.
   */
  deleteNode(backgroundClickAfter = true, deletePath = true, silent = false) {
    //Remove this input from the parent molecule
    if (typeof this.parent !== "undefined") {
      this.parent.removeIO("input", this.name, this.parent, silent);
    }

    super.deleteNode(backgroundClickAfter, deletePath, silent);
  }

  /**
   * Called when the name has changed to updated the name of the parent molecule IO
   */
  updateParentName() {
    //Run through the parent molecule and find the input with the same name
    this.parent.inputs.forEach((child) => {
      if (child.name == this.oldName) {
        child.name = this.name;
      }
    });
    this.oldName = this.name;
  }

  /**
   * Grabs the new value from the parent molecule's input, sets this atoms value, then propagates.
   */
  updateValue() {
    this.parent.inputs.forEach((input) => {
      //Grab the value for this input from the parent's inputs list
      if (input.name == this.name) {
        //If we have found the matching input
        this.decreaseToProcessCountByOne();
        this.value = input.getValue();
        this.output.waitOnComingInformation(); //Lock all of the dependents
        this.output.setValue(this.value);
        this.parent.updateIO(
          "input",
          this.name,
          this.parent,
          this.type,
          this.value
        );
      }
    });
  }
  /**
   * Create Leva Menu Inputs for Editable Input Names - returns to ParameterEditor
   */
  createLevaInputs() {
    let inputNames = {};
    inputNames[this.uniqueID] = {
      value: this.name,
      label: "Input Name",
      disabled: false,
      onChange: (value) => {
        if (this.name !== value) {
          this.name = value;
        }
      },
    };
    inputNames[this.uniqueID + "type"] = {
      value: this.type,
      label: "Input Type",
      disabled: false,
      options: ["number", "string", "geometry", "array"],
      onChange: (value) => {
        if (this.type !== value) {
          this.type = value;
          this.output.valueType = value;
          //Add a new input to the current molecule
          if (typeof this.parent !== "undefined") {
            this.parent.updateIO(
              "input",
              this.name,
              this.parent,
              this.type,
              this.value
            );
          }
        }
      },
    };
    return inputNames;
  }
  /**
   * Returns the current value being output
   */
  getOutput() {
    return this.output.getValue();
  }

  /**
   * Add the input Type choice to the object which is saved for this molecule
   */
  serialize(offset = { x: 0, y: 0 }) {
    var superSerialObject = super.serialize(offset);

    //Write the current color selection to the serialized object
    superSerialObject.type = this.type;

    return superSerialObject;
  }
}
