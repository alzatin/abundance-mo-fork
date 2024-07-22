import GlobalVariables from "../../js/globalvariables.js";

function ShareDialog(props) {
  const dialogContent = props.dialogContent;
  return (
    <>
      <dialog
        open={props.shareDialog}
        style={{ display: "flex" }}
        className="share-dialog"
      >
        {dialogContent == "share" ? (
          <div style={{ display: "flex", margin: "10px" }}>
            <p>Use this link to share this project:</p>
            <a
              style={{ margin: "16px" }}
              href={"/run/" + GlobalVariables.currentRepo.id}
              target="_blank"
            >
              /run/{GlobalVariables.currentRepo.id}
            </a>
          </div>
        ) : dialogContent == "export" ? (
          <div style={{ display: "flex", margin: "10px" }}>
            <p>Export as:</p>
            <button autoFocus onClick={() => console.log("STL")}>
              {" "}
              STL
            </button>
            <button autoFocus onClick={() => console.log("STEP")}>
              {" "}
              STEP
            </button>
            <button autoFocus onClick={() => console.log("SVG")}>
              {" "}
              SVG
            </button>
          </div>
        ) : null}

        <button
          className="closeButton"
          onClick={() => props.setShareDialog(false)}
        ></button>
      </dialog>
    </>
  );
}

export default ShareDialog;
