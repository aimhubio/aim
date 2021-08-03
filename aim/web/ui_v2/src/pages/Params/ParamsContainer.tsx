import React, { useState } from 'react';

import Params from './Params';
import { CurveEnum } from 'utils/d3';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const [curveInterpolation, setCurveInterpolation] = useState(
    CurveEnum.Linear,
  );

  function curveInterpolationChangeHandler() {
    setCurveInterpolation(
      curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear,
    );
  }

  return (
    <Params
      chartElemRef={chartElemRef}
      curveInterpolation={curveInterpolation}
      curveInterpolationChangeHandler={curveInterpolationChangeHandler}
    />
  );
}

export default ParamsContainer;
