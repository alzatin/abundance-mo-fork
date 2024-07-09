import Atom from "../prototypes/atom";
import GlobalVariables from "../js/globalvariables.js";
import { button, LevaInputs } from "leva";

/**
 * This class creates the tag atom.
 */
export default class Tag extends Atom {
  /**
   * The constructor function.
   * @param {object} values An array of values passed in which will be assigned to the class as this.x
   */
  constructor(values) {
    super(values);

    this.addIO("input", "geometry", this, "geometry", "", false, true);
    //this.addIO("input", "tag", this, "string", "Tag String");
    this.addIO("output", "geometry", this, "geometry", "");

    /**
     * This atom's name
     * @type {string}
     */
    this.name = "Add Tag";
    /**
     * This atom's type
     * @type {string}
     */
    this.atomType = "Tag";
    /**
     * This atom's height as drawn on the screen
     */
    this.height;
    /**
     * A description of this atom
     * @type {string}
     */
    this.description = "Tags geometry so that it can be extracted later.";

    /** Array of tags for this atom */
    this.tags = [""];

    /** Flag for cutlist tag */
    this.cutTag = false;

    this.setValues(values);
  }

  /**
   * Draw the constant which is more rectangular than the regular shape.
   */
  draw() {
    super.draw("rect");

    let pixelsRadius = GlobalVariables.widthToPixels(this.radius);
    /**
     * Relates height to radius
     * @type {number}
     */
    this.height = pixelsRadius;

    GlobalVariables.c.beginPath();
    GlobalVariables.c.fillStyle = "#484848";
    GlobalVariables.c.font = `${pixelsRadius}px Work Sans Bold`;
    GlobalVariables.c.fillText(
      String.fromCharCode(0x0023),
      GlobalVariables.widthToPixels(this.x - this.radius / 3),
      GlobalVariables.heightToPixels(this.y) + this.height / 3
    );
    GlobalVariables.c.fill();
    GlobalVariables.c.closePath();
  }

  checkHasTag() {
    return this.cutTag;
  }

  addTagsToAvailableTags() {
    let newProjectTags = Array.from(
      new Set(
        GlobalVariables.topLevelMolecule.projectAvailableTags.concat(this.tags)
      )
    );
    GlobalVariables.topLevelMolecule.projectAvailableTags = newProjectTags;
  }

  createLevaInputs() {
    let inputParams = {};

    inputParams[this.uniqueID + "cut_string"] = {
      value: this.cutTag,
      label: "Cut List Tag",
      onChange: (value) => {
        if (this.cutTag !== value) {
          if (value === true) {
            this.cutTag = true;
            this.tags.push("cutLayout");
            this.name = this.tags.toString();
            this.updateValue();
          } else {
            this.cutTag = false;
            this.tags = this.tags.filter((e) => e !== "cutLayout");
            this.name = this.tags.toString();
            this.updateValue();
          }
        }
      },
    };
    inputParams[this.uniqueID + "custom_string"] = {
      value: this.tags.filter((e) => e !== "cutLayout")[0],
      label: "Add Tag",
      disabled: false,
      onChange: (value) => {
        this.tags = this.cutTag ? ["cutLayout"] : [];
        this.tags.push(value);
        this.name = this.tags.toString();
        this.updateValue();
      },
    };

    return inputParams;
  }
  /**
   * Add a tag to the input geometry. The substance is not changed.
   */
  updateValue() {
    super.updateValue();
    if (GlobalVariables.isInCancelQueue(this.uniqueID)) {
      return;
    } else {
      if (this.inputs.every((x) => x.ready)) {
        this.processing = true;
        var inputID = this.findIOValue("geometry");
        var tags = this.tags;
        this.addTagsToAvailableTags();
        GlobalVariables.cad
          .tag(this.uniqueID, inputID, tags)
          .then(() => {
            this.basicThreadValueProcessing();
          })
          .catch(this.alertingErrorHandler());
      }
    }
  }
  /**
   * Send the value of this atom to the 3D display. Used to display the number
   */
  sendToRender() {
    // do nothing
    console.log("tag has nothing to render");
  }

  /**
   * Add the file name to the object which is saved for this molecule
   */
  serialize() {
    var superSerialObject = super.serialize();
    superSerialObject.tags = this.tags;
    superSerialObject.cutTag = this.cutTag;

    return superSerialObject;
  }
}
