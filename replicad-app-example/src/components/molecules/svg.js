import Atom from "../prototypes/atom";
import GlobalVariables from "../js/globalvariables.js";
import { button } from "leva";
//import saveAs from '../lib/FileSaver.js'

/**
 * This class creates the svg atom which lets you download a .svg file.
 */
export default class Svg extends Atom {
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
    this.name = "Svg";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Svg";

    /**
     * This atom's value. Contains the value of the input geometry, not the stl
     * @type {string}
     */
    this.value = null;
    /**
     * A description of this atom
     * @type {string}
     */
    this.description =
      "Exports an svg of the input geometry. Before generating an SVG the shape will be moved rest on the XY plane and the outline will be generated.";

    /**
     * This atom's height as drawn on the screen
     */
    this.height = 0;

    this.addIO("input", "geometry", this, "geometry", null);

    this.setValues(values);
  }

  /**
   * Draw the svg atom which has a SVG icon.
   */
  draw() {
    super.draw("rect");

    let pixelsRadius = GlobalVariables.widthToPixels(this.radius);
    this.height = pixelsRadius * 1.5;

    GlobalVariables.c.beginPath();
    GlobalVariables.c.fillStyle = "#484848";
    GlobalVariables.c.font = `${pixelsRadius / 1.2}px Work Sans`;
    GlobalVariables.c.fillText(
      "Svg",
      GlobalVariables.widthToPixels(this.x - this.radius / 1.4),
      GlobalVariables.heightToPixels(this.y) + this.height / 6
    );
    GlobalVariables.c.fill();
    GlobalVariables.c.closePath();
  }

  /**
   * Compute the outline
   */
  updateValue() {
    try {
      var inputPath = this.findIOValue("geometry");
      const values = {
        op: "outline",
        readPath: inputPath,
        writePath: this.path,
      };

      this.basicThreadValueProcessing(values);
    } catch (err) {
      this.setAlert(err);
    }
  }

  /**
   * Create Leva Menu Input - returns to ParameterEditor
   */
  createLevaInputs() {
    // foo: button((get) => alert(`Number value is ${get('number').toFixed(2)}`))
    let outputParams = {};
    outputParams["Download SVG"] = button(() => this.downloadSvg());
    return outputParams;
  }

  /**
   * The function which is called when you press the download button.
   */
  downloadSvg() {
    console.log("try downloading svg");
    try {
      inputValue = this.findIOValue("geometry");
      GlobalVariables.cad.getSVG(inputValue);

      //var enc = new TextDecoder("utf-8");

      //const blob = new Blob([result]);
      // saveAs(blob, GlobalVariables.currentMolecule.name+'.svg')
    } catch (err) {
      this.setAlert(err);
    }
  }
}
