import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function SideBar(props) {
  return (
    <>
      <div className="sideBar" value={GlobalVariables.currentRepo}>
        {GlobalVariables.currentRepo
          ? GlobalVariables.currentRepo.name +
            " " +
            GlobalVariables.currentRepo.owner.login
          : null}
      </div>
    </>
  );
}

export default SideBar;
