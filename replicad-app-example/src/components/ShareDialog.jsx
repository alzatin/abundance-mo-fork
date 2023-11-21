import React, { useEffect, useState, useRef } from "react";
import GlobalVariables from "./js/globalvariables.js";

function ShareDialog() {
  return (
    <>
      {GlobalVariables.currentRepo ? (
        <dialog>
          <button
            autoFocus
            onClick={() => {
              var shareDialog = document.querySelector("dialog");
              shareDialog.close();
            }}
          >
            Close
          </button>
          <p>Use this link to share this project</p>
          <a href={"/run/" + GlobalVariables.currentRepo.id} target="_blank">
            /run/{GlobalVariables.currentRepo.id}
          </a>
        </dialog>
      ) : null}
    </>
  );
}

export default ShareDialog;
