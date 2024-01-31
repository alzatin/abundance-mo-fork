import React, { useState, useEffect, useMemo } from "react";
import globalvariables from "./js/globalvariables";

import { useControls, useCreateStore, LevaPanel, button } from "leva";

/**Creates new collapsible sidebar with Leva - edited from Replicad's ParamsEditor.jsx */
export default (function ParamsEditor({ activeAtom, run, setGrid, setAxes }) {
  let inputParams = {};
  let bomParams = {};
  const store1 = useCreateStore();
  const store2 = useCreateStore();

  /*Work around Leva collapse issue */
  /**https://github.com/pmndrs/leva/issues/456#issuecomment-1537510948 */
  const [collapsed, setCollapsed] = useState(true);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCollapsed(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  if (activeAtom !== null) {
    /** Creates Leva inputs inside each atom */
    inputParams = activeAtom.createLevaInputs();
    /** Creates Leva inputs for BOM if active atom is molecule  */

    if (activeAtom.atomType == "Molecule") {
      activeAtom.createLevaBomInputs().then((res) => {
        bomParams = res;
      });
    }
  }

  const bomParamsConfig = useMemo(() => {
    return { ...bomParams };
  }, [bomParams]);
  const inputParamsConfig = useMemo(() => {
    return { ...inputParams };
  }, [inputParams]);

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
      buttn: button(() => console.log("button working")),

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
          neverHide
          collapsed={{
            collapsed,
            onChange: (value) => {
              setCollapsed(value);
            },
          }}
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
