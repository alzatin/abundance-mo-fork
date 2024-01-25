import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";

import { useParams } from "react-router-dom";
import { Octokit } from "https://esm.sh/octokit@2.0.19";
import globalvariables from "./js/globalvariables";

import {
  useControls,
  useStoreContext,
  useCreateStore,
  LevaPanel,
  levaStore,
  LevaStoreProvider,
  Leva,
  folder,
} from "leva";
import { falseDependencies } from "mathjs";

/**Creates new collapsible sidebar with Leva - edited from Replicad's ParamsEditor.jsx */
export default observer(function ParamsEditor({
  activeAtom,
  setActiveAtom,
  hidden,
  run,
  setGrid,
  setAxes,
}) {
  let inputParams = {};
  let outputParams = {};
  let inputNames = {};
  let bomParams = {};
  const store1 = useCreateStore();
  const store2 = useCreateStore();

  if (activeAtom !== null) {
    /** Runs through active atom inputs and adds IO parameters to default param*/
    if (activeAtom.inputs) {
      activeAtom.inputs.map((input) => {
        const checkConnector = () => {
          return input.connectors.length > 0;
        };

        /*Checks for inputs labeled geometry and disables them / (bug: might be storing and deleting geometry as input)*/
        if (input.valueType !== "geometry") {
          inputParams[input.name] = {
            value: input.value,
            disabled: checkConnector(),
            onChange: (value) => {
              input.setValue(value);
              activeAtom.sendToRender();
            },
          };
        }
      });
    }
    /** Maps special molecule cases - input, constant, equation, molecule*/
    let output = activeAtom.output;
    if (activeAtom.atomType == "Input") {
      inputNames[activeAtom.name] = {
        value: activeAtom.name,
        label: activeAtom.name,
        disabled: false,
        onChange: (value) => {
          activeAtom.name = value;
        },
      };
    }
    if (activeAtom.atomType == "Constant") {
      outputParams[activeAtom.name] = {
        value: output.value,
        label: output.name,
        disabled: false,
        onChange: (value) => {
          output.value = value;
        },
      };
    }
    if (activeAtom.atomType == "Add-BOM-Tag") {
      for (const key in activeAtom.BOMitem) {
        bomParams[key] = {
          value: activeAtom.BOMitem[key],
          label: key,
          disabled: false,
          onChange: (value) => {
            activeAtom.BOMitem[key] = value;
            activeAtom.updateValue();
          },
        };
      }
    }
    if (activeAtom.atomType == "Molecule") {
      activeAtom.extractBomTags(activeAtom.output.value).then((result) => {
        if (result != undefined) {
          result.map((item) => {
            console.log(item.BOMitemName);
            bomParams["other"] = {
              value: item.BOMitemName,
              label: "me",
              disabled: false,
            };
          });
        }
      });
    }
  }

  const bomParamsConfig = useMemo(() => {
    return { ...bomParams };
  }, [bomParams]);
  const outputParamsConfig = useMemo(() => {
    return { ...outputParams };
  }, [outputParams]);
  const inputParamsConfig = useMemo(() => {
    return { ...inputParams };
  }, [inputParams]);
  const inputNamesConfig = useMemo(() => {
    return { ...inputNames };
  }, [inputNames]);

  /** Creates Leva panel with parameters from active atom inputs */

  useControls(
    () => ({
      description: {
        label: "Description",
        value: activeAtom.description,
        rows: 6,
        disabled: true,
      },
    }),
    { store: store1 },
    [activeAtom]
  );
  useControls(() => bomParamsConfig, { store: store1 }, [activeAtom]);
  useControls(() => inputParamsConfig, { store: store1 }, [activeAtom]);
  useControls(() => outputParamsConfig, { store: store1 }, [activeAtom]);
  useControls(() => inputNamesConfig, { store: store1 }, [activeAtom]);

  /** Creates Leva panel with grid settings */
  useControls(
    "Grid",
    {
      grid: {
        value: true,
        label: "show grid",
        onChange: (value) => {
          setGrid(value);
        },
      },
      axes: {
        value: true,
        label: "show axes",
        onChange: (value) => {
          setAxes(value);
        },
      },
    },
    { store: store2 }
  );

  useEffect(
    () => () => {
      store1.dispose();
    },
    [activeAtom]
  );

  return (
    <>
      {" "}
      <div className={run ? "paramEditorDivRun" : "paramEditorDiv"}>
        <LevaPanel
          store={store1}
          hidden={false}
          collapsed={true}
          hideCopyButton
          fill
          titleBar={{
            title: activeAtom.name || globalvariables.currentRepo.name,
          }}
          theme={{
            colors: {
              elevation1: "#3F4243",
              elevation2: "var(--bg-color)",
              elevation3: "#C4A3D5", // bg color of the root panel (main title bar)

              highlight1: "#C4A3D5",
              highlight2: "#ededed",
              highlight3: "#ededed",

              accent1: "#C4A3D5",
              accent2: "#88748F", //apply button
              accent3: "#88748F",

              vivid1: "red",
            },
          }}
        />
      </div>
      <div className={run ? "gridEditorDivRun" : "gridEditorDiv"}>
        <LevaPanel
          store={store2}
          fill
          hidden={false}
          collapsed={true}
          hideCopyButton
          titleBar={{
            title: "Render Settings",
          }}
          theme={{
            colors: {
              elevation1: "#3F4243",
              elevation2: "var(--bg-color)",
              elevation3: "#C4A3D5", // bg color of the root panel (main title bar)

              highlight1: "#C4A3D5",
              highlight2: "#ededed",
              highlight3: "#ededed",

              accent1: "#C4A3D5",
              accent2: "#88748F", //apply button
              accent3: "#88748F",

              vivid1: "red",
            },
          }}
        />
      </div>
    </>
  );
});
