import React from 'react';

import Params from './Params';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import paramsAppModel from 'services/models/params/paramsAppModel';
import useModel from 'hooks/model/useModel';
import { IChartTooltip } from 'types/services/models/metrics/metricsAppModel';
import usePanelResize from 'hooks/resize/usePanelResize';
import { ITableRef } from 'types/components/Table/Table';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';

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
      groupingData={
        paramsData?.config?.grouping as IParamsAppConfig['grouping']
      }
      selectedParamsData={
        paramsData?.config?.select as IParamsAppConfig['select']
      }
      curveInterpolation={paramsData?.config?.chart?.curveInterpolation}
      tooltip={paramsData?.config?.chart?.tooltip as IChartTooltip}
      onColorIndicatorChange={paramsAppModel.onColorIndicatorChange}
      onCurveInterpolationChange={paramsAppModel.onCurveInterpolationChange}
      onParamsSelectChange={paramsAppModel.onParamsSelectChange}
      onGroupingSelectChange={paramsAppModel.onGroupingSelectChange}
      onGroupingModeChange={paramsAppModel.onGroupingModeChange}
      onGroupingPaletteChange={paramsAppModel.onGroupingPaletteChange}
      onGroupingReset={paramsAppModel.onGroupingReset}
      onActivePointChange={paramsAppModel.onActivePointChange}
      onGroupingApplyChange={paramsAppModel.onGroupingApplyChange}
      onGroupingPersistenceChange={paramsAppModel.onGroupingPersistenceChange}
      onSelectRunQueryChange={paramsAppModel.onSelectRunQueryChange}
      onBookmarkCreate={paramsAppModel.onBookmarkCreate}
      onBookmarkUpdate={paramsAppModel.onBookmarkUpdate}
      onNotificationAdd={paramsAppModel.onNotificationAdd}
      onNotificationDelete={paramsAppModel.onNotificationDelete}
      onResetConfigData={paramsAppModel.onResetConfigData}
      onChangeTooltip={paramsAppModel.onChangeTooltip}
    />
  );
}

export default ParamsContainer;
