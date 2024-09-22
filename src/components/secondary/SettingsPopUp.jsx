import React, { useState } from "react";

const SettingsPopUp = (props) => {
  const { setSettingsPopUp } = props;

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
