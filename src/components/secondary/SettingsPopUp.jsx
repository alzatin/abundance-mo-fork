import React, { useState, useRef } from "react";
import Globalvariables from "../../js/globalvariables.js";
import CreatableSelect from "react-select/creatable";
import topics from "../../js/maslowTopics.js";

const SettingsPopUp = (props) => {
  const { setSettingsPopUp } = props;
  console.log("SettingsPopUp");
  console.log(Globalvariables.currentRepo);
  console.log(Globalvariables.topLevelMolecule);
  let repoTopics = [];
  Globalvariables.currentRepo.topics.forEach((topic) => {
    repoTopics.push({ value: topic, label: topic });
  });

  const projectRef = useRef(Globalvariables.currentRepo.repoName);
  const projectTopicRef = useRef(repoTopics);
  const projectDescriptionRef = useRef(Globalvariables.currentRepo.description);
  const projectLicenseRef = useRef();
  const projectUnitsRef = useRef(Globalvariables.topLevelMolecule.unitsKey);

  /* Handles form submission for create new/ export project form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    //setPending(true);
    //const projectName = projectRef.current.value;
    const projectTopicArray = projectTopicRef.current.getValue();
    const projectDescription = projectDescriptionRef.current.value;
    const projectTopic = [];
    //const projectLicense = projectLicenseRef.current.value;
    const projectUnits = projectUnitsRef.current.value;

    projectTopicArray.forEach((topic) => {
      projectTopic.push(topic[`value`]);
    });
    console.log(projectTopic);
    Globalvariables.currentRepo.topics = projectTopic;
    console.log(Globalvariables.currentRepo);
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
            <p>{Globalvariables.currentRepo.repoName}</p>
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
            placeholder="Project Description"
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
          <select id="measure-units" ref={projectUnitsRef}>
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
