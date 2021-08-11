import React from 'react';

import Params from './Params';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import paramsAppModel from 'services/models/params/paramsAppModel';
import useModel from 'hooks/model/useModel';

const paramsRequestRef = paramsAppModel.getParamsData();

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const paramsData = useModel(paramsAppModel);

  React.useEffect(() => {
    paramsAppModel.initialize();
    paramsRequestRef.call();
    return () => {
      paramsRequestRef.abort();
    };
  }, []);

  return (
    <Params
      chartElemRef={chartElemRef}
      highPlotData={paramsData?.highPlotData}
      chartPanelRef={chartPanelRef}
      focusedState={paramsData?.config?.chart?.focusedState}
      isVisibleColorIndicator={
        paramsData?.config?.chart?.isVisibleColorIndicator
      }
      curveInterpolation={paramsData?.config?.chart?.curveInterpolation}
      onColorIndicatorChange={paramsAppModel?.onColorIndicatorChange}
      onCurveInterpolationChange={paramsAppModel?.onCurveInterpolationChange}
      onActivePointChange={paramsAppModel?.onActivePointChange}
    />
  );
}

export default ParamsContainer;
