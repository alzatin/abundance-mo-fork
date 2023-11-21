import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";
import { Link } from "react-router-dom";

function ToggleRunCreate(props) {
  const handleChange = () => {
    props.setRunMode(!props.runModeon);
  };
  if (!props.runModeon) {
    return (
      <>
        <Link
          key={
            GlobalVariables.currentRepo ? GlobalVariables.currentRepo.id : null
          }
          to={
            GlobalVariables.currentRepo
              ? `/run/${GlobalVariables.currentRepo.id}`
              : "/run"
          }
          onClick={handleChange}
        >
          <label title="Create/Run Mode" className="switch">
            <input type="checkbox"></input>
            <span className="slider round"></span>
          </label>
        </Link>
      </>
    );
  } else {
    return (
      <>
        <Link
          key={GlobalVariables.currentRepo.id}
          to={`/${GlobalVariables.currentRepo.id}`}
          onClick={handleChange}
        >
          <label title="Create/Run Mode" className="switch">
            <input type="checkbox" defaultChecked></input>
            <span className="slider round"></span>
          </label>
        </Link>
      </>
    );
  }
}

export default ToggleRunCreate;
