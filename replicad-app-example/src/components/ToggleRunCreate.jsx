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
          style={{ position: "absolute" }}
        >
          <label title="Create/Run Mode" className="switch">
            <button>
              <svg
                width="12"
                height="8"
                viewBox="0 0 9 5"
                xmlns="http://www.w3.org/2000/svg"
                class="leva-c-cHvNmv"
                style={{ transform: "rotate(-90deg)" }}
              >
                <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z"></path>
              </svg>
            </button>
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
            <button>
              <svg
                width="12"
                height="8"
                viewBox="0 0 9 5"
                xmlns="http://www.w3.org/2000/svg"
                class="leva-c-cHvNmv"
                style={{ transform: "rotate(90deg)" }}
              >
                <path d="M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z"></path>
              </svg>
            </button>
          </label>
        </Link>
      </>
    );
  }
}

export default ToggleRunCreate;
