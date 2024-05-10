import React from "react";
import { useEffect, useState } from "react";
import ReactCodeEditor from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

export default function CodeWindow(props) {
  const doc = "Hello World";
  const [docvalue, setdocValue] = useState("");
  const extensions = [keymap.of(defaultKeymap)];

  return (
    <div id="code-window" className=" code-off login-page export-div">
      <ReactCodeEditor
        width="200px"
        height="200px"
        extensions={extensions}
        value={docvalue}
        onChange={(value) => {
          setdocValue(value);
        }}
      />
      <button
        type="button"
        onClick={() => props.activeAtom.updateValue(docvalue)}
      >
        Save Code
      </button>
    </div>
  );
}

/*function CodeWindow() {

    
  //console.log(CodeMirror);
  useEffect(() => {
    var myTextArea = document.getElementById("code_area");
  });

  return (
    <div id="code-window" className=" code-off login-page export-div">
      <form>
        <textarea id="code_area"></textarea>
        <button type="submit">Save Code</button>
      </form>
    </div>
  );
}

export default CodeWindow;

/* var form = document.createElement("form");
popup.appendChild(form);
var button = document.createElement("button");
button.setAttribute("type", "button");
button.appendChild(document.createTextNode("Save Code"));
button.addEventListener("click", () => {
  //this.code = codeMirror.getDoc().getValue('\n')
  this.updateValue();
  popup.classList.add("off");
});
form.appendChild(button);*/
