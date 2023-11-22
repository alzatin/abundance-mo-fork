import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function SideBar(props) {
  console.log(props.activeAtom);

  const EditableContent = (props) => {
    const [value, setValue] = useState(props.initialValue);

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
      }
    };

    const handleValueChange = (value) => {
      setValue(value);

      props.input.value = value;
      console.log(props.input.value);
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
                    return (
                      <>
                        <li>
                          <div className="sidebar-item sidebar-editable-div">
                            <label className="sidebar-subitem label-item">
                              <span>{input.name}</span>

                              <EditableContent
                                input={input}
                                initialValue={input["value"]}
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
