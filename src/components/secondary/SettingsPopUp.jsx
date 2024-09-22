import React, { useState } from "react";

const SettingsPopUp = (props) => {
  const [inputFields, setInputFields] = useState([
    "Molecule Name",
    "Units",
    "",
  ]); // Initialize with three empty fields
  const { setSettingsPopUp } = props;

  const handleInputChange = (index, event) => {
    const values = [...inputFields];
    values[index] = event.target.value;
    setInputFields(values);
  };

  return (
    <div className="settingsDiv">
      <div className="form animate fadeInUp one">
        <button
          style={{ width: "3%", display: "block" }}
          onClick={() => {
            setSettingsPopUp(false);
          }}
          className="closeButton"
        >
          {" "}
        </button>
        <h2>Settings</h2>

        {inputFields.map((value, index) => (
          <>
            <label htmlFor="${value}">{value}</label>
            <input
              key={index}
              type="text"
              value={value}
              label={value}
              onChange={(event) => handleInputChange(index, event)}
            />
          </>
        ))}

        <label htmlFor="shortcuts">Shortcuts</label>
        <input
          type="checkbox"
          className="checkbox shortcut-button"
          name={"shortcut-button"}
          id={"shortcut-button"}
        />
      </div>
    </div>
  );
};

export default SettingsPopUp;
