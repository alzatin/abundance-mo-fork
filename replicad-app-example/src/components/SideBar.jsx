import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import AttachmentPoint from "./prototypes/attachmentpoint";

/**
 * SideBar component creates elements that displays inputs and outputs of
 * a selected Atom with editable fields for input atoms
 * @prop {object} activeAtom - selected atom on screen
 */
function SideBar(props) {
  let valueInBox;
  let resultShouldBeANumber = false;

  /**
   * Function component that creates editable form fields for input atoms
   * @prop {object} input - selected atom on screen
   * @prop {object} initialvalue - name of editable name of input atom
   */
  const EditableContent = (props) => {
    const [valueState, setValueState] = useState(props.initialvalue);

    const [isEditing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
      const { current } = inputRef;
      if (current && isEditing) {
        current.focus();
      }
    }, [isEditing]);

    const handleKeyDown = (event, type) => {
      const { key } = event;
      const keys = ["Escape", "Tab"];
      const enterKey = "Enter";
      const allKeys = [...keys, enterKey];
      if (
        (type === "textarea" && keys.indexOf(key) > -1) ||
        (type !== "textarea" && allKeys.indexOf(key) > -1)
      ) {
        setEditing(false);
        valueInBox = valueState;

        if (props.input instanceof AttachmentPoint) {
          valueInBox = GlobalVariables.limitedEvaluate(valueInBox);

          props.input.setValue(valueInBox);
        } else {
          // if it's not an attachment point you are changing the name of an inputAtom
          props.input.name = valueInBox;
        }
      }
    };

    const handleValueChange = (value) => {
      setValueState(value);
      valueInBox = value.trim();

      if (resultShouldBeANumber) {
        valueInBox = GlobalVariables.limitedEvaluate(valueInBox);
      }
    };

    return (
      <section
        {...props}
        ref={wrapperRef}
        onClick={() => setEditing(true)}
        onBlur={() => setEditing(false)}
      >
        {isEditing ? (
          <div
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => handleKeyDown(e, props.type)}
          >
            <textarea
              className="sidebar-editable-area"
              ref={inputRef}
              type={props.type}
              value={valueState}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          </div>
        ) : (
          <div className="sidebar-editable-area">{valueState}</div>
        )}
      </section>
    );
  };

  return (
    <>
      <div className="sideBar" value={GlobalVariables.currentRepo}>
        <p className="molecule_title">{props.activeAtom.name}</p>
        <p className="atom_description">
          {GlobalVariables.currentRepo
            ? GlobalVariables.currentRepo.description
            : "placeholder description"}
        </p>
        <div className="sidebar-title">Outputs</div>
        <div>
          {" "}
          {/** if the selected atom is an inputAtom make an editable name and value */}
          {props.activeAtom.output && props.activeAtom.atomType == "Input" ? (
            <div className="sidebar-editable-div sidebar-item">
              <label className="sidebar-label-item">
                {" "}
                <EditableContent
                  input={props.activeAtom}
                  initialvalue={props.activeAtom.output.parentMolecule.name}
                />
              </label>
              <label className="sidebar-label-item">
                <EditableContent
                  input={props.activeAtom.output}
                  initialvalue={props.activeAtom.output.value}
                />
              </label>
            </div>
          ) : (
            <div>
              {props.activeAtom.output ? (
                <section className="sidebar-editable-div sidebar-item">
                  <label className="sidebar-label-item">
                    {props.activeAtom.output.name}
                  </label>
                  <div>
                    {props.activeAtom.output.connectors.length > 0 ? (
                      <div>&#9989;</div>
                    ) : (
                      <div>&#10062;</div>
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
        <div>
          <div className="sidebar-title">Inputs</div>
          {/** maps through the selected atom's input and creates editable value divs   */}
          {props.activeAtom.inputs
            ? props.activeAtom.inputs.map((input) => {
                let initialvalue = input["value"];
                let editableValue = true;
                if (
                  input.type == "input" &&
                  input.valueType != "geometry" &&
                  input.connectors.length == 0
                ) {
                  if (input.valueType == "number") {
                    resultShouldBeANumber = true;
                  } else {
                    resultShouldBeANumber = false;
                  }
                }
                //this value should not be editable - check if geometry is connected and mark in some way for it to be visible in sidebar
                if (input.valueType === "geometry") {
                  editableValue = false;
                }

                return (
                  <div
                    key={input.uniqueID}
                    className="sidebar-editable-div sidebar-item"
                  >
                    <label className="sidebar-label-item">{input.name}</label>

                    {editableValue ? (
                      <EditableContent
                        input={input}
                        initialvalue={initialvalue}
                      />
                    ) : (
                      <div>
                        <section className="sidebar-editable-div">
                          {input.value == "" ? (
                            <div>&#10062;</div>
                          ) : (
                            <div>&#9989;</div>
                          )}{" "}
                        </section>
                      </div>
                    )}
                  </div>
                );
              })
            : null}
        </div>
        <p></p>

        <ul className="sidebar-list"></ul>
      </div>
    </>
  );
}

export default SideBar;
