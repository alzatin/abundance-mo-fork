import React, { useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useControls, levaStore, Leva } from "leva";

export default observer(function ParamsEditor({
  activeAtom,
  defaultParams,
  hidden,
  onRun,
}) {
  defaultParams = {};

  if (activeAtom.inputs) {
    activeAtom.inputs.map((input) => {
      console.log(input.value);
      defaultParams[input.name] = input.value;
    });

    console.log(defaultParams);
  }

  const runFcn = useRef(onRun);
  useEffect(() => {
    runFcn.current = onRun;
  }, [onRun]);

  const paramsConfig = useMemo(() => {
    return {
      _run: {
        type: "BUTTON",
        onClick: (get) =>
          runFcn.current(
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
    []
  );

  return <></>;
});
