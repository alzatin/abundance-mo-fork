import Atom from "../prototypes/atom";
import GlobalVariables from "../js/globalvariables.js";

/**
 * This class creates the rotate atom.
 */
export default class Rotate extends Atom {
  /**
   * The constructor function.
   * @param {object} values An array of values passed in which will be assigned to the class as this.x
   */
  constructor(values) {
    super(values);

    this.addIO("input", "geometry", this, "geometry", "", false, true);
    this.addIO("input", "x-axis degrees", this, "number", 0);
    this.addIO("input", "y-axis degrees", this, "number", 0);
    this.addIO("input", "z-axis degrees", this, "number", 0);
    this.addIO("output", "geometry", this, "geometry", "");
    this.addIO("input", "Pivot", this, "array", [0, 0, 0]);

    /**
     * This atom's name
     * @type {string}
     */
    this.name = "Rotate";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Rotate";
    /**
     * A description of this atom
     * @type {string}
     */
    this.description =
      "Rotates the input geometry around the X, Y, or Z axis. Inputs are degrees.";

    this.setValues(values);
  }

  /**
   * Draw the circle atom & icon.
   */
  draw() {
    super.draw(); //Super call to draw the rest

    GlobalVariables.c.beginPath();
    GlobalVariables.c.fillStyle = "#949294";
    GlobalVariables.c.ellipse(
      GlobalVariables.widthToPixels(this.x),
      GlobalVariables.heightToPixels(this.y),
      GlobalVariables.widthToPixels(this.radius / 1.5),
      GlobalVariables.widthToPixels(this.radius / 2.3),
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    GlobalVariables.c.stroke();
    GlobalVariables.c.closePath();
  }

  /**
   * Create Leva Menu Inputs - returns to ParameterEditor
   */
  createLevaInputs() {
    let inputParams = {};

    /*inputParams[this.uniqueID + "pivot"] = {
      value: { x: 0, y: 0, z: 0 },
      label: "Pivot",
      onChange: (value) => {
        this.findIOValue("Pivot").setValue(value);
        this.sendToRender();
      },
    };*/

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
              input.setValue(value);
              /** should we run updateValue too? */
              this.sendToRender();
            },
          };
        }
      });
      return inputParams;
    }
  }

  /**
   * Pass the input shape to a worker thread to compute the rotation
   */
  updateValue() {
    try {
      var inputID = this.findIOValue("geometry");
      var x = this.findIOValue("x-axis degrees");
      var y = this.findIOValue("y-axis degrees");
      var z = this.findIOValue("z-axis degrees");
      var pivot = this.findIOValue("Pivot");

      GlobalVariables.cad
        .rotate(this.uniqueID, inputID, x, y, z, pivot)
        .then(() => {
          this.basicThreadValueProcessing();
        });
    } catch (err) {
      this.setAlert(err);
    }
  }
}
