import Connector from "./connector.js";
import GlobalVariables from "../js/globalvariables.js";

/**
 * This class creates a new attachmentPoint which are the input and output blobs on Atoms
 */
export default class AttachmentPoint {
  /**
   * The constructor function.
   * @param {object} values An array of values passed in which will be assigned to the class as this.x
   */
  constructor(values) {
    /**
     * This atom's default radius (non hover)
     * @type {number}
     */
    this.defaultRadius = 1 / 60;
    /**
     * A flag to indicate if this attachment point is currently expanded.
     * @type {boolean}
     */
    this.expandedRadius = false;
    /**
     * This atom's current radius as displayed.
     * @type {number}
     */
    this.radius = 1 / 60;
    /**
     * When the mouse is hovering where should the AP move in X
     * @type {number}
     */
    this.hoverOffsetX = 0;
    /**
     * When the mouse is hovering where should the AP move in Y
     * @type {number}
     */
    this.hoverOffsetY = 0;
    /**
     * The attachment points X position
     * @type {number}
     */
    this.x = 0;
    /**
     * The attachment point's Y position
     * @type {number}
     */
    this.y = 0;
    /**
     * A unique identifying number for this attachment point
     * @type {number}
     */
    this.uniqueID = 0;
    /**
     * The default offset position in X referenced to the center of the parent atom.
     * @type {number}
     */
    this.defaultOffsetX = 0;
    /**
     * The default offset position in Y referenced to the center of the parent atom.
     * @type {number}
     */
    this.defaultOffsetY = 0;
    /**
     * The current offset position in X referenced to the center of the parent atom.
     * @type {number}
     */
    this.offsetX = 0;
    /**
     * The current offset position in Y referenced to the center of the parent atom.
     * @type {number}
     */
    this.offsetY = 0;
    /**
     * A flag to determine if the hover text is shown next to the attachment point.
     * @type {boolean}
     */
    this.showHoverText = true;
    /**
     * The attachment point type.
     * @type {string}
     */
    this.atomType = "AttachmentPoint";

    /**
     * The attachment point value type. Options are number, geometry, array.
     * @type {string}
     */
    this.valueType = "number";
    /**
     * The attachment point type. Options are input, output.
     * @type {string}
     */
    this.type = "output";

    /**
     * This is a flag to indicate if the attachment point is of the primary type.
     * Primary type inputs are of the form geometry.translate(input2, input3, input4) for example
     * This value is useful for importing molecules into other formats. I don't know if this is used any more. Maybe it can be deleted.
     * @type {boolean}
     */
    this.primary = false;

    /**
     * The attachment point current value.
     * @type {number}
     */
    this.value = 10;

    /**
     * The default value to be used by the ap when nothing is attached
     * @type {string}
     */
    this.defaultValue = 10;

    /**
     * A flag to indicate if the attachment point is currently ready. Used to order initilization when program is loaded.
     * @type {string}
     */
    this.ready = true;
    /**
     * A list of all of the connectors attached to this attachment point
     * @type {object}
     */
    this.connectors = [];

    this.offsetX = this.defaultOffsetX;
    this.offsetY = this.defaultOffsetY;

    for (var key in values) {
      /**
       * Assign values in values as this.x
       */
      this[key] = values[key];
    }
    this.unexpand(); // Initially hide all connection points.
  }

  /**
   * Draws the attachment point on the screen. Called with each frame.
   */
  draw() {
    let xInPixels = GlobalVariables.widthToPixels(this.x);
    let yInPixels = GlobalVariables.heightToPixels(this.y);
    let radiusInPixels = GlobalVariables.widthToPixels(this.radius);
    let parentRadiusInPixels = GlobalVariables.widthToPixels(
      this.parentMolecule.radius
    );
    let parentXInPixels = GlobalVariables.widthToPixels(this.parentMolecule.x);
    let parentYInPixels = GlobalVariables.heightToPixels(this.parentMolecule.y);

    this.defaultRadius = radiusInPixels;
    radiusInPixels = parentRadiusInPixels / 2.7;

    if (this.expandedRadius) {
      radiusInPixels = parentRadiusInPixels / 2.4;
    }
    if (this.parentMolecule.inputs.length < 2 && this.type == "input") {
      //This prevents single attachment points from expanding out
      /**
       * The x coordinate of the attachment point.
       */
      xInPixels = parentXInPixels - parentRadiusInPixels;
      this.x = this.parentMolecule.x - this.parentMolecule.radius; //This makes sure it says it is where it actually is
      /**
       * The y coordinate of the attachment point.
       */
      yInPixels = parentYInPixels;
    } else if (this.parentMolecule.inputs.length < 2 && this.type == "output") {
      xInPixels = parentXInPixels + parentRadiusInPixels;
      yInPixels = parentYInPixels;
    }

    var txt = this.name;
    var textWidth = GlobalVariables.c.measureText(txt).width;
    GlobalVariables.c.font = "10px Work Sans";

    var bubbleColor = "#C300FF";
    var scaleRadiusDown = radiusInPixels * 0.7;
    var halfRadius = radiusInPixels * 0.5;

    if (this.showHoverText) {
      if (this.type == "input") {
        GlobalVariables.c.globalCompositeOperation = "destination-over";
        GlobalVariables.c.beginPath();

        if (this.name === "geometry") {
          GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor;
        } else {
          GlobalVariables.c.fillStyle = bubbleColor;
        }

        //Draws bubble shape
        GlobalVariables.c.rect(
          xInPixels - textWidth - radiusInPixels - halfRadius,
          yInPixels - radiusInPixels,
          textWidth + radiusInPixels + halfRadius,
          radiusInPixels * 2
        );
        GlobalVariables.c.arc(
          xInPixels - textWidth - radiusInPixels - halfRadius,
          yInPixels,
          radiusInPixels,
          0,
          Math.PI * 2,
          false
        );

        //Bubble text
        GlobalVariables.c.fill();
        GlobalVariables.c.globalCompositeOperation = "source-over";
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor;
        GlobalVariables.c.textAlign = "end";
        GlobalVariables.c.fillText(
          this.name,
          xInPixels - (radiusInPixels + 3),
          yInPixels + 2
        );
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
      } else {
        GlobalVariables.c.beginPath();

        if (this.name === "geometry") {
          GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor;
        } else {
          GlobalVariables.c.fillStyle = bubbleColor;
        }

        GlobalVariables.c.rect(
          xInPixels,
          yInPixels - scaleRadiusDown,
          textWidth + radiusInPixels + halfRadius,
          scaleRadiusDown * 2
        );
        GlobalVariables.c.arc(
          xInPixels + textWidth + radiusInPixels + halfRadius,
          yInPixels,
          scaleRadiusDown,
          0,
          Math.PI * 2,
          false
        );
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor;
        GlobalVariables.c.textAlign = "start";
        GlobalVariables.c.fillText(
          this.name,
          xInPixels + halfRadius + (radiusInPixels + 3),
          yInPixels + 2
        );
        GlobalVariables.c.fill();
        GlobalVariables.c.closePath();
      }
    }

    GlobalVariables.c.beginPath();
    if (this.ready) {
      GlobalVariables.c.fillStyle = this.parentMolecule.color;
    } else {
      GlobalVariables.c.fillStyle = "#6ba4ff";
    }
    GlobalVariables.c.strokeStyle = this.parentMolecule.strokeColor;
    GlobalVariables.c.lineWidth = 1;

    GlobalVariables.c.arc(
      xInPixels,
      yInPixels,
      radiusInPixels,
      0,
      Math.PI * 2,
      false
    );
    if (this.showHoverText == true) {
      GlobalVariables.c.fill();
      GlobalVariables.c.stroke();
    }
    GlobalVariables.c.closePath();

    if (!this.expandedRadius) {
      if (this.type == "output") {
        this.offsetX = this.parentMolecule.radius;
      }
    }
  }

  /**
   * Handles mouse click down. If the click is inside the AP it's connectors are selected if it is an input.
   * @param {number} x - The x coordinate of the click
   * @param {number} y - The y coordinate of the click
   * @param {boolean} clickProcessed - Has the click already been handled
   */
  clickDown(x, y, clickProcessed) {
    let xInPixels = GlobalVariables.widthToPixels(this.x);
    let yInPixels = GlobalVariables.heightToPixels(this.y);

    if (
      GlobalVariables.distBetweenPoints(xInPixels, x, yInPixels, y) <
      this.defaultRadius &&
      !clickProcessed
    ) {
      if (this.type == "output") {
        //begin to extend a connector from this if it is an output
        new Connector({
          parentMolecule: this.parentMolecule,
          attachmentPoint1: this,
          atomType: "Connector",
          isMoving: true,
        });
      }
      if (this.type == "input") {
        //connectors can only be selected by clicking on an input
        this.connectors.forEach((connector) => {
          //select any connectors attached to this node
          connector.selected = true;
        });
      }

      return true; //indicate that the click was handled by this object
    } else {
      if (this.type == "input") {
        //connectors can only be selected by clicking on an input
        this.connectors.forEach((connector) => {
          //unselect any connectors attached to this node
          connector.selected = false;
        });
      }
      return false; //indicate that the click was not handled by this object
    }
  }

  /**
   * Handles mouse click up. If the click is inside the AP and a connector is currently extending, then a connection is made
   * @param {number} x - The x coordinate of the click
   * @param {number} y - The y coordinate of the click
   */
  clickUp(x, y) {
    this.connectors.forEach((connector) => {
      connector.clickUp(x, y);
    });
  }

  /**
   * Handles mouse click and move to expand the AP. Could this be done with a call to expand out?
   * @param {number} x - The x coordinate of the click
   * @param {number} y - The y coordinate of the click
   */
  mouseMove(x, y) {
    let xInPixels = GlobalVariables.widthToPixels(this.x);
    let yInPixels = GlobalVariables.heightToPixels(this.y);
    let radiusInPixels = GlobalVariables.widthToPixels(this.radius);

    let parentXInPixels = GlobalVariables.widthToPixels(this.parentMolecule.x);
    let parentYInPixels = GlobalVariables.heightToPixels(this.parentMolecule.y);
    let parentRadiusInPixels = GlobalVariables.widthToPixels(
      this.parentMolecule.radius
    );

    //expand if touched by mouse
    var distFromClick = Math.abs(
      GlobalVariables.distBetweenPoints(parentXInPixels, x, parentYInPixels, y)
    );

    let activationBoundary = parentRadiusInPixels * 3.5;
    //If we are close to the attachment point move it to it's hover location to make it accessible
    if (distFromClick < activationBoundary && this.type == "input") {
      this.expandOut(activationBoundary);
      this.showHoverText = true;
    } else if (
      distFromClick < parentRadiusInPixels * 1.5 &&
      this.type == "output"
    ) {
      this.showHoverText = true;
    } else {
      this.unexpand();
      this.expandedRadius = false;
    }
    //Expand it if you are close enough to make connection
    if (
      GlobalVariables.distBetweenPoints(xInPixels, x, yInPixels, y) <
      radiusInPixels
    ) {
      this.expandedRadius = true;
    } else {
      this.expandedRadius = false;
    }

    this.connectors.forEach((connector) => {
      connector.mouseMove(x, y);
    });
  }

  /**
   * Unexpands this attachment point, eg: when the app starts, when the mouse
   * is moved out of the expansion range, etc.
   */
  unexpand() {
    if (this.type == "input") {
      this.offsetX = -1 * this.parentMolecule.radius;
      this.offsetY = this.defaultOffsetY;
    }
    this.showHoverText = false;
  }

  /**
   * Handles mouse click down. If the click is inside the AP it's connectors are selected if it is an input.
   * @param {number} boundary - The maximum distance for attachement points to be from their parent, in pixels.
   */
  expandOut(boundary) {
    const inputList = this.parentMolecule.inputs.filter(
      (input) => input.type == "input"
    );
    const attachmentPointNumber = inputList.indexOf(this);
    const anglePerIO = Math.PI / (inputList.length + 1);
    // TODO: refactor our radius values. This / 2.7 seems arbitrary but it gets picked up in draw and is
    // used as the actual drawn radius.
    // Reduce radius to ensure that the entire attachment point is inside boundary.
    const hoverRadius = boundary - GlobalVariables.widthToPixels(this.parentMolecule.radius) / 2.7;

    // angle correction so that it centers menu adjusting to however many attachment points there are
    const angleCorrection = -Math.PI / 2 - anglePerIO;
    this.hoverOffsetY =
      hoverRadius *
      Math.sin(attachmentPointNumber * anglePerIO - angleCorrection);
    this.hoverOffsetX =
      hoverRadius *
      Math.cos(attachmentPointNumber * anglePerIO - angleCorrection);

    this.offsetX = GlobalVariables.pixelsToWidth(this.hoverOffsetX);
    this.offsetY = GlobalVariables.pixelsToHeight(this.hoverOffsetY);
  }

  /**
   * Just passes a key press to the attached connectors. No impact on the connector.
   * @param {string} key - The key which was pressed
   */
  keyPress(key) {
    this.connectors.forEach((connector) => {
      connector.keyPress(key);
    });
  }

  /**
   * Delete any connectors attached to this ap
   */
  deleteSelf(silent = false) {
    //remove any connectors which were attached to this attachment point
    var connectorsList = [...this.connectors]; //Make a copy of the list so that we can delete elements without having issues with forEach as we remove things from the list
    connectorsList.forEach((connector) => {
      connector.deleteSelf(silent);
    });
  }

  /**
   * Delete a target connector which is passed in. The default option is to delete all of the connectors.
   */
  deleteConnector(connector = "all") {
    try {
      const connectorIndex = this.connectors.indexOf(connector);
      if (connectorIndex != -1) {
        this.connectors.splice(connectorIndex, 1); //Remove the target connector
      } else {
        this.connectors = []; //Remove all of the connectors
      }
    } catch (err) {
      console.warn("Error deleting connector: ");
      console.warn(err);
    }
  }

  /**
   * Can be called to see if the target coordinates are within this ap. Returns true/false.
   * @param {number} x - The x coordinate of the target
   * @param {number} y - The y coordinate of the target
   */
  wasConnectionMade(x, y) {
    let xInPixels = GlobalVariables.widthToPixels(this.x);
    let yInPixels = GlobalVariables.heightToPixels(this.y);
    let radiusInPixels = GlobalVariables.widthToPixels(this.radius);

    //this function returns itself if the coordinates passed in are within itself
    if (
      GlobalVariables.distBetweenPoints(xInPixels, x, yInPixels, y) <
      radiusInPixels &&
      this.type == "input"
    ) {
      //If we have released the mouse here and this is an input...

      if (this.connectors.length > 0) {
        //Don't accept a second connection to an input
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * Attaches a new connector to this ap
   * @param {object} connector - The connector to attach
   */
  attach(connector) {
    this.connectors.push(connector);
  }

  /**
   * Starts propagation from this attachmentPoint if it is not waiting for anything up stream.
   */
  beginPropagation() {
    //If nothing is connected it is a starting point
    if (this.connectors.length == 0) {
      this.setValue(this.value);
    }
  }

  /**
   * Passes a lock command to the parent molecule, or to the attached connector depending on input/output.
   */
  waitOnComingInformation() {
    if (this.type == "output") {
      this.connectors.forEach((connector) => {
        connector.waitOnComingInformation();
      });
    } else {
      //If this is an input
      this.ready = false;
      this.parentMolecule.waitOnComingInformation(this.name);
    }
  }

  /**
   * Restores the ap to it's default value.
   */
  setDefault() {
    this.setValue(this.defaultValue);
  }

  /**
   * Updates the default value for the ap.
   */
  updateDefault(newDefault) {
    var oldDefault = this.defaultValue;
    this.defaultValue = newDefault;

    if (this.connectors.length == 0 && this.value == oldDefault) {
      //Update the value to be the default if there is nothing attached
      this.value = this.defaultValue;
    }
  }

  /**
   * Reads and returns the current value of the ap.
   */
  getValue() {
    return this.value;
  }

  /**
   * Sets the current value of the ap. Force forces an update even if the value hasn't changed.
   */
  setValue(newValue) {
    this.value = newValue;
    this.ready = true;
    //propagate the change to linked elements if this is an output
    if (this.type == "output") {
      this.connectors.forEach((connector) => {
        //select any connectors attached to this node
        connector.propogate();
      });
    }
    //if this is an input attachment point
    else {
      this.parentMolecule.updateValue(this.name);
    }
  }

  /**
   * Computes the curent position and then draws the ap on the screen.
   */
  update() {
    this.x = this.parentMolecule.x + this.offsetX;
    this.y = this.parentMolecule.y + this.offsetY;
    this.draw();

    this.connectors.forEach((connector) => {
      //update any connectors attached to this node
      connector.update();
    });
  }
}
