import React, { useState } from 'react';

import Params from './Params';
import { CurveEnum } from 'utils/d3';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);

  const [curveInterpolation, setCurveInterpolation] = useState(
    CurveEnum.Linear,
  );

  function onCurveInterpolationChange() {
    setCurveInterpolation(
      curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear,
    );
  }

  return (
    <Params
      chartElemRef={chartElemRef}
      chartPanelRef={chartPanelRef}
      curveInterpolation={curveInterpolation}
      onCurveInterpolationChange={onCurveInterpolationChange}
    />
  );
}

export default ParamsContainer;
