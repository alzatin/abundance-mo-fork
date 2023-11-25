import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import AttachmentPoint from "./prototypes/attachmentpoint";

function SideBar(props) {
  const EditableContent = (props) => {
    const [value, setValue] = useState(props.initialvalue);

    const [isEditing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    let valueInBox;

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
        props.input.setValue(valueInBox);
      }
    };

    const handleValueChange = (value) => {
      setValue(value);
      valueInBox = value.trim();
      if (props.resultShouldBeANumber) {
        valueInBox = GlobalVariables.limitedEvaluate(valueInBox);
      }

      if (props.input instanceof AttachmentPoint) {
        props.input.setValue(valueInBox);
      } else {
        props.input["value"] = valueInBox;
        callBack(valueInBox);
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
        <div>
          {props.activeAtom.inputs
            ? props.activeAtom.inputs.map((input) => {
                if (
                  input.type == "input" &&
                  input.valueType != "geometry" &&
                  input.connectors.length == 0
                ) {
                  if (input.valueType == "number") {
                    var resultShouldBeANumber = true;
                    let initialvalue = input["value"];
                    return (
                      <>
                        <li>
                          <div className="sidebar-item sidebar-editable-div">
                            <label className="sidebar-subitem label-item">
                              <span>{input.name}</span>

                              <EditableContent
                                input={input}
                                initialvalue={initialvalue}
                                resultShouldBeANumber={resultShouldBeANumber}
                              />
                            </label>
                          </div>
                        </li>
                      </>
                    );
                    //this.createEditableValueListItem(valueList,input,'value', input.name, true)
                  } else {
                    //this.createEditableValueListItem(valueList,input,'value', input.name, false)
                  }
                }
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
