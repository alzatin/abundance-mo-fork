import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import AttachmentPoint from "./prototypes/attachmentpoint";

function SideBar(props) {
  let valueInBox;
  let resultShouldBeANumber = false;
  const EditableContent = (props) => {
    const [value, setValue] = useState(props.initialvalue);

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
        if (props.input instanceof AttachmentPoint) {
          props.input.setValue(valueInBox);
        } else {
          props.input["value"] = valueInBox;
          callBack(valueInBox);
        }
      }
    };

    const handleValueChange = (value) => {
      setValue(value);

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
              ref={inputRef}
              type={props.type}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <p>{value}</p>
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <div className="sideBar" value={GlobalVariables.currentRepo}>
        <p className="molecule_title">{props.activeAtom.name}</p>
        <p className="atom_description">
          {GlobalVariables.currentRepo.description}
        </p>
        <div>Atom Inputs</div>
        <div>
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
                //this value should not be editable
                if (input.valueType === "geometry") {
                  editableValue = false;
                }

                return (
                  <li key={input.uniqueID}>
                    <div className="sidebar-item sidebar-editable-div">
                      <label className="sidebar-subitem label-item">
                        <span>{input.name}</span>
                        {editableValue ? (
                          <EditableContent
                            input={input}
                            initialvalue={initialvalue}
                          />
                        ) : null}
                      </label>
                    </div>
                  </li>
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
