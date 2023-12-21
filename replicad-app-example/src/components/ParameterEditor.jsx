import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useControls, levaStore, Leva } from "leva";

/**Creates new collapsible sidebar with Leva - edited from Replicad's ParamsEditor.jsx */
export default observer(function ParamsEditor({
  activeAtom,
  defaultParams,
  hidden,
}) {
  defaultParams = {};

  /** Runs through active atom inputs and adds IO parameters to default param*/
  if (activeAtom.inputs) {
    activeAtom.inputs.map((input) => {
      defaultParams[input.name] = input.value;
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

  useControls(() => paramsConfig, [activeAtom]);

  useEffect(
    () => () => {
      levaStore.dispose();
    },
    [activeAtom]
  );

  return (
    <>
      {" "}
      <Leva
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
    </>
  );
});
