import GlobalVariables from "../js/globalvariables.js";

function ShareDialog(props) {
  return (
    <>
      {props.shareDialog ? (
        <dialog
          open={props.shareDialog}
          style={{ display: "flex" }}
          className="share-dialog"
        >
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
          <button autoFocus onClick={() => props.setShareDialog(false)}>
            Close
          </button>
        </dialog>
      ) : null}
    </>
  );
}

export default ShareDialog;
