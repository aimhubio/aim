import React, { useState } from 'react';

import Params from './Params';
import { CurveEnum } from 'utils/d3';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);

  const [curveInterpolation, setCurveInterpolation] = useState<CurveEnum>(
    CurveEnum.Linear,
  );
  const [focusedState, setFocusedState] = useState<IFocusedState>({
    key: null,
    xValue: null,
    yValue: null,
    active: false,
    chartIndex: null,
  });

  function onActivePointChange(
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ): void {
    setFocusedState({
      active: !!focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
    });
  }

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
      focusedState={focusedState}
      onCurveInterpolationChange={onCurveInterpolationChange}
      onActivePointChange={onActivePointChange}
    />
  );
}

export default ParamsContainer;
