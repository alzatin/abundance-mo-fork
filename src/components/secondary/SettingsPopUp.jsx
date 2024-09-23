import React, { useState, useRef } from "react";
import Globalvariables from "../../js/globalvariables.js";
import CreatableSelect from "react-select/creatable";
import topics from "../../js/maslowTopics.js";

const SettingsPopUp = (props) => {
  const { setSettingsPopUp, setShortCuts } = props;

  let repoTopics = [];
  Globalvariables.currentRepo.topics.forEach((topic) => {
    repoTopics.push({ value: topic, label: topic });
  });
  //const projectRef = useRef(Globalvariables.currentRepo.repoName);
  const projectTopicRef = useRef(repoTopics);
  const projectDescriptionRef = useRef(Globalvariables.currentRepo.description);
  //const projectLicenseRef = useRef();
  const projectUnitsRef = useRef(Globalvariables.topLevelMolecule.unitsKey);
  const shortcutsRef = useRef(Globalvariables.displayShortcuts);

  /* Handles form submission for create new/ export project form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSettingsPopUp(false);
    //const projectName = projectRef.current.value; add tooltip directing user to github to change project name
    const projectTopicArray = projectTopicRef.current.getValue();
    const projectTopic = [];
    //const projectLicense = projectLicenseRef.current.value;
    projectTopicArray.forEach((topic) => {
      projectTopic.push(topic[`value`]);
    });
    Globalvariables.topLevelMolecule.unitsKey = projectUnitsRef.current.value;
    Globalvariables.currentRepo.description =
      projectDescriptionRef.current.value;
    Globalvariables.currentRepo.topics = projectTopic;
    Globalvariables.displayShortcuts = shortcutsRef.current.checked;
    setShortCuts(shortcutsRef.current.checked);
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
        <h2 style={{ margin: "0 0 15px 0" }}>Project Preferences</h2>
        <div id="project-info">
          <div id="project-info-name">
            <label>Project Name</label>
            <p title="To change the Project Name go to your Github repository">
              {Globalvariables.currentRepo.repoName}
            </p>
          </div>
          <div id="project-info-date">
            <label>Date Created</label>
            <p>{Globalvariables.currentRepo.dateCreated}</p>
          </div>
        </div>

        <form
          className="settings-form project-info"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          {/*Project name change?? */}
          <label htmlFor="project-description">Project Description</label>
          <input
            defaultValue={Globalvariables.currentRepo.description}
            ref={projectDescriptionRef}
          />
          <label htmlFor="project-topics">Project Tags</label>
          <CreatableSelect
            defaultValue={repoTopics}
            isMulti
            name="Project Topics"
            options={topics}
            className="basic-multi-select"
            classNamePrefix="select"
            ref={projectTopicRef}
          />
          <label htmlFor="measure-units">Units</label>
          <select
            id="measure-units"
            defaultValue={Globalvariables.topLevelMolecule.unitsKey}
            ref={projectUnitsRef}
          >
            <option key={"inchesop"} value={"Inches"}>
              Inches
            </option>
            <option key={"millop"} value={"MM"}>
              MM
            </option>
          </select>
          <div>
            <label htmlFor="shortcut-button">Show/Hide Shortcuts</label>
            {/*toggle between displaying ghost shortcuts and not */}
            <input
              type="checkbox"
              className="checkbox shortcut-button"
              name={"shortcut-button"}
              id={"shortcut-button"}
              defaultChecked={Globalvariables.displayShortcuts}
              ref={shortcutsRef}
            />
          </div>
          <label htmlFor="theme-toggle">Display Theme</label>
          <input
            type="checkbox"
            className="checkbox "
            name={"theme-toggle"}
            id={"theme-toggle"}
          />
          <button className="submit-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPopUp;
