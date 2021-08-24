import React from 'react';

import Params from './Params';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import paramsAppModel from 'services/models/params/paramsAppModel';
import useModel from 'hooks/model/useModel';
import { ITooltipContent } from 'types/services/models/metrics/metricsAppModel';
import usePanelResize from 'hooks/resize/usePanelResize';
import { ITableRef } from 'types/components/Table/Table';

const paramsRequestRef = paramsAppModel.getParamsData();

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableRef = React.useRef<ITableRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const paramsData = useModel(paramsAppModel);
  usePanelResize(wrapperElemRef, chartElemRef, tableElemRef, resizeElemRef);

  React.useEffect(() => {
    paramsAppModel.initialize();
    paramsRequestRef.call();
    return () => {
      paramsRequestRef.abort();
    };
  }, []);

  return (
    <Params
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      highPlotData={paramsData?.highPlotData}
      focusedState={paramsData?.config?.chart?.focusedState}
      isVisibleColorIndicator={
        paramsData?.config?.chart?.isVisibleColorIndicator
      }
      onParamsSelectChange={paramsAppModel?.onParamsSelectChange}
      curveInterpolation={paramsData?.config?.chart?.curveInterpolation}
      tooltipContent={paramsData?.tooltipContent as ITooltipContent}
      onColorIndicatorChange={paramsAppModel?.onColorIndicatorChange}
      onCurveInterpolationChange={paramsAppModel?.onCurveInterpolationChange}
      onActivePointChange={paramsAppModel?.onActivePointChange}
      selectedParamsData={paramsData?.config?.select?.params}
    />
  );
}

export default ParamsContainer;
