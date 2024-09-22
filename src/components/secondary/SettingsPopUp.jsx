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
        {/*Project name change?? */}
        <label htmlFor="description">Project Description</label>
        {/*Project description change input */}
        <label htmlFor="topics">Project Topics</label>
        {/*Select for topic change */}
        <label htmlFor="shortcuts">Shortcuts</label>
        {/*toggle between displaying ghost shortcuts and not */}
        <input
          type="checkbox"
          className="checkbox shortcut-button"
          name={"shortcut-button"}
          id={"shortcut-button"}
        />
        <label>Display Theme</label>
        {/*toggle between light and dark mode */}
        <label>Project Units</label>
        {/*toggle between mm and inches */}
      </div>
    </div>
  );
};

export default SettingsPopUp;
