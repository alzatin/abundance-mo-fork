import React from "react";
import { useEffect, useState } from "react";
import ReactCodeEditor from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

/*
 * CodeWindow component is a code editor window that allows the user to edit the code of the active code atom.
 */
export default function CodeWindow(props) {
  const [docvalue, setdocValue] = useState("");
  const extensions = [keymap.of(defaultKeymap)];

  useEffect(() => {
    if (props.activeAtom != null) {
      setdocValue(props.activeAtom.code);
    }
  }, [props.activeAtom]);

  /**
   * Closes the code editor window.
   */
  function closeEditor() {
    const codeWindow = document.getElementById("code-window");
    codeWindow.classList.add("code-off");
  }

  return (
    <div id="code-window" className=" code-off login-page code-window-div">
      <ReactCodeEditor
        width="600px"
        height="300px"
        extensions={extensions}
        value={docvalue}
        onChange={(value) => {
          setdocValue(value);
        }}
      />
      <button
        type="button"
        onClick={() => props.activeAtom.updateCode(docvalue)}
      >
        Save Code
      </button>
      <button type="button" onClick={() => closeEditor()}>
        Close Editor
      </button>
    </div>
  );
}
