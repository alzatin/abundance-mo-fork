import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function SideBar(props) {
  console.log(props.activeAtom);
  return (
    <>
      <div className="sideBar" value={GlobalVariables.currentRepo}>
        <p className="molecule_title">{props.activeAtom.name}</p>
        <p className="atom_description">
          {GlobalVariables.currentRepo.description}
        </p>
        <p></p>

        <ul className="sidebar-list"></ul>
      </div>
    </>
  );
}

export default SideBar;
