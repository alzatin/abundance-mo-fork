import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import {
  useControls,
  useStoreContext,
  useCreateStore,
  LevaPanel,
  levaStore,
  LevaStoreProvider,
  Leva,
} from "leva";

/**Creates new collapsible sidebar with Leva - edited from Replicad's ParamsEditor.jsx */
export default observer(function ParamsEditor({
  activeAtom,
  defaultParams,
  setActiveAtom,
  hidden,
  setGrid,
}) {
  defaultParams = {};

  const store1 = useCreateStore();
  const store2 = useCreateStore();

  /** Runs through active atom inputs and adds IO parameters to default param*/
  if (activeAtom.inputs) {
    activeAtom.inputs.map((input) => {
      defaultParams[input.name] = input.value;
      /**need to change this simple value to also have settings
       *  like disabled or type of input */
    });
  }

  /** Handles parameter change button click and updates active atom inputs */
  function handleParamChange(newParams) {
    activeAtom.inputs.map((input) => {
      input.setValue(newParams[input.name]);
      activeAtom.sendToRender();
    });
  }

  const paramsConfig = useMemo(() => {
    return {
      _run: {
        type: "BUTTON",
        onClick: (get) =>
          handleParamChange(
            Object.fromEntries(
              levaStore
                .getVisiblePaths()
                .filter((f) => f !== "_run")
                .map((f) => [f, get(f)])
            )
          ),
        settings: { disabled: false },
        label: "Apply params",
        transient: false,
      },

      ...defaultParams,
    };
  }, [defaultParams]);

  /** Creates Leva panel with parameters from active atom inputs */
  useControls(() => paramsConfig, { store: store1 }, [activeAtom]);

  /** Creates Leva panel with grid settings */
  useControls(
    {
      color: { value: "#fff", label: "grid-color" },
      grid: {
        value: true,
        label: "show grid",
        onChange: (value) => {
          console.log(value);
          console.log(setGrid(value));
        },
      },
      axes: { value: true, label: "show axes" },
    },
    { store: store2 }
  );

  useEffect(
    () => () => {
      console.log(paramsConfig);
      levaStore.dispose();
    },
    [activeAtom]
  );

  return (
    <>
      {" "}
      <div className="paramEditorDiv">
        <LevaPanel
          store={store1}
          fill
          hidden={false}
          collapsed={true}
          hideCopyButton
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
      <div className="gridEditorDiv">
        <LevaPanel
          store={store2}
          fill
          hidden={false}
          collapsed={true}
          hideCopyButton
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
