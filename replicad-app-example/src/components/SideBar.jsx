import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function SideBar(props) {
  console.log("sidebar rerender");
  return (
    <>
      <div className="sideBar" value={GlobalVariables.currentRepo}>
        <p className="molecule_title">{GlobalVariables.currentRepo.name}</p>
        <p className="atom_description">
          {GlobalVariables.currentRepo.description}
        </p>
        <p>{GlobalVariables.atomsSelected}</p>

        <ul className="sidebar-list"></ul>
      </div>
    </>
  );
}

export default SideBar;
