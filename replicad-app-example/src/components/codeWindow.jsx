import React from "react";
import { useEffect, useState } from "react";
import ReactCodeEditor from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

export default function CodeWindow(props) {
  const [docvalue, setdocValue] = useState("");
  const extensions = [keymap.of(defaultKeymap)];

  useEffect(() => {
    if (props.activeAtom != null) {
      setdocValue(props.activeAtom.code);
    }
  }, [props.activeAtom]);

  function closeEditor() {
    const codeWindow = document.getElementById("code-window");
    codeWindow.classList.add("code-off");
  }

  return (
    <div id="code-window" className=" code-off login-page export-div">
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
