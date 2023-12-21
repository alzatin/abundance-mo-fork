import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useControls, levaStore, Leva } from "leva";

/**Creates new collapsible sidebar with Leva - edited from Replicad's ParamsEditor.jsx */
export default observer(function ParamsEditor({
  activeAtom,
  defaultParams,
  hidden,
  onRun,
}) {
  defaultParams = {};

  /** Runs through active atom inputs and adds IO parameters to default param*/
  if (activeAtom.inputs) {
    activeAtom.inputs.map((input) => {
      defaultParams[input.name] = input.value;
    });
  }
  console.log(defaultParams);
  /*const runFcn = useRef(onRun);
  useEffect(() => {
    runFcn.current = onRun;
  }, [onRun]);*/

  /** Handles parameter change button click and updates active atom inputs */
  function handleParamChange(newParams) {
    activeAtom.inputs.map((input) => {
      console.log(input);
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

  return <></>;
});
