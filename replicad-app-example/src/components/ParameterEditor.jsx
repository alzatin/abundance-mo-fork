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
  hidden,
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
    });
  }

  const paramsConfig = useMemo(() => {
    return {
      _run: {
        type: "BUTTON",
        onClick: (get) =>
          handleParamChange(
            Object.fromEntries(
              store1
                .getVisiblePaths()
                .filter((f) => f !== "_run")
                .map((f) => [f, get(f)])
            )
          ),
        settings: { disabled: false },
        label: "Apply params",
        transient: false,
      },
      _runi: {
        settings: { disabled: false },
        transient: true,
        value: 4,
        min: 0,
        max: 10,
        step: 1,
      },
      ...defaultParams,
    };
  }, [defaultParams]);

  const gridConfig = useMemo(() => {
    return {
      _runi: {
        settings: { disabled: false },
        transient: true,
        value: 4,
        min: 0,
        max: 10,
        step: 1,
      },
      store: store2,
    };
  }, []);

  //useControls({ color: "#fff" }, { store: store1 });

  useControls(() => paramsConfig, [activeAtom]);
  useControls(
    {
      color: { value: "#fff", label: "grid-color" },
      grid: { value: true, label: "show grid" },
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
