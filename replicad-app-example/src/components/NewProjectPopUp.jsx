import React, { useEffect, useState, useRef } from "react";
import { licenses } from "./js/licenseOptions.js";
import globalvariables from "./js/globalvariables.js";

//Replaces the loaded projects if the user clicks on new project button
const NewProjectPopUp = (props) => {
  const keys_ar = [];
  Object.keys(licenses).forEach((key) => {
    keys_ar.push(key);
  });
  const projectRef = useRef();
  const projectTagsRef = useRef();
  const projectDescriptionRef = useRef();
  const [pending, setPending] = useState(false); // useFormStatus(); in the future
  const [newProjectBar, setNewProjectBar] = useState(0);

  const authorizedUserOcto = props.authorizedUserOcto;
  const setExportPopUp = props.setExportPopUp;

  // Create a new project and navigate to new project create page
  const createProject = async ([name, tags, description], molecule) => {
    // if a molecule is passed to this function then we are exporting a molecule to a new project
    if (molecule) {
      GlobalVariables.topLevelMolecule = molecule;
      molecule.topLevel = true; //force the molecule to export in the long form as if it were the top level molecule
    } else {
      //Load a blank project
      GlobalVariables.topLevelMolecule = new Molecule({
        x: 0,
        y: 0,
        topLevel: true,
        name: name,
        atomType: "Molecule",
        uniqueID: GlobalVariables.generateUniqueID(),
      });
    }

    GlobalVariables.currentMolecule = GlobalVariables.topLevelMolecule;

    await authorizedUserOcto
      .request("POST /user/repos", {
        name: name,
        description: description,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .catch((err) => {
        window.alert(
          "Error creating project. That name might be taken already. Please try again with a different name."
        );
        setPending(false);
      })
      .then((result) => {
        setNewProjectBar(10);
        //Once we have created the new repo we need to create a file within it to store the project in
        currentRepoName = result.data.name;
        currentUser = GlobalVariables.currentUser;
        GlobalVariables.currentRepo = result.data;

        var jsonRepOfProject = GlobalVariables.topLevelMolecule.serialize();
        jsonRepOfProject.filetypeVersion = 1;
        const projectContent = window.btoa(
          JSON.stringify(jsonRepOfProject, null, 4)
        );

        authorizedUserOcto.rest.repos
          .createOrUpdateFileContents({
            owner: currentUser,
            repo: currentRepoName,
            path: "project.maslowcreate",
            message: "initialize repo",
            content: projectContent,
          })
          .then((result) => {
            setNewProjectBar(20);
            //Then create the BOM file
            var content = window.btoa(bomHeader); // create a file with just the header in it and base64 encode it
            authorizedUserOcto.rest.repos
              .createOrUpdateFileContents({
                owner: currentUser,
                repo: currentRepoName,
                path: "BillOfMaterials.md",
                message: "initialize BOM",
                content: content,
              })
              .then(() => {
                setNewProjectBar(30);
                //Then create the README file
                content = window.btoa(readmeHeader); // create a file with just the word "init" in it and base64 encode it
                authorizedUserOcto.rest.repos
                  .createOrUpdateFileContents({
                    owner: currentUser,
                    repo: currentRepoName,
                    path: "README.md",
                    message: "initialize README",
                    content: content,
                  })
                  .then(() => {
                    setNewProjectBar(40);
                    authorizedUserOcto.rest.repos
                      .createOrUpdateFileContents({
                        owner: currentUser,
                        repo: currentRepoName,
                        path: "project.svg",
                        message: "SVG Picture",
                        content: "",
                      })
                      .then(() => {
                        setNewProjectBar(50);
                        authorizedUserOcto.rest.repos
                          .createOrUpdateFileContents({
                            owner: currentUser,
                            repo: currentRepoName,
                            path: ".gitattributes",
                            message: "Create gitattributes",
                            content: window.btoa("data binary"),
                          })
                          .then(() => {
                            setNewProjectBar(60);
                            authorizedUserOcto.rest.repos
                              .createOrUpdateFileContents({
                                owner: currentUser,
                                repo: currentRepoName,
                                path: "data.json",
                                message: "Data file",
                                content: "",
                              })
                              .then(() => {
                                setNewProjectBar(90);
                                let licenseText = ""; // ?
                                authorizedUserOcto.rest.repos
                                  .createOrUpdateFileContents({
                                    owner: currentUser,
                                    repo: currentRepoName,
                                    path: "LICENSE.txt",
                                    message: "Establish license",
                                    content: window.btoa(licenseText),
                                  })
                                  .then(() => {
                                    setExportPopUp(false);
                                    navigate(
                                      `/${GlobalVariables.currentRepo.id}`
                                    );
                                  });
                              });
                          });
                      });
                  });
              });
          });

        //Update the project topics
        authorizedUserOcto.rest.repos.replaceAllTopics({
          owner: currentUser,
          repo: currentRepoName,
          names: ["maslowcreate", "maslowcreate-project"],
          s: {
            accept: "application/vnd.github.mercy-preview+json",
          },
        });
      });
  };

  /* Handles form submission for create new project form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    const projectName = projectRef.current.value;
    const projectTags = projectTagsRef.current.value;
    const projectDescription = projectDescriptionRef.current.value;

    if (globalvariables.currentMolecule) {
      var molecule = globalvariables.currentMolecule;
    }
    createProject([projectName, projectTags, projectDescription], molecule);
  };
  return (
    <>
      <div className="login-page export-div">
        <div className="form animate fadeInUp one">
          <button
            style={{ width: "3%", display: "block" }}
            onClick={() => {
              setExportPopUp(false);
            }}
            className="closeButton"
          >
            <img></img>
          </button>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <input
              name="Project Name"
              placeholder="Project Name"
              ref={projectRef}
            />
            <input
              name="Project Tags"
              ref={projectTagsRef}
              placeholder="Project Tags"
            />
            {/*<select id="license-options">
              {keys_ar.map((opt) => {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                );
              })}
            </select>*/}
            <input
              placeholder="Project Description"
              ref={projectDescriptionRef}
            />
            <button disabled={pending} type="submit">
              {pending ? newProjectBar + "%" : "Submit/Export to Github"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewProjectPopUp;
