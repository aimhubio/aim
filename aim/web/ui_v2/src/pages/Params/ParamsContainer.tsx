import React from 'react';

import Params from './Params';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import paramsAppModel from 'services/models/params/paramsAppModel';
import useModel from 'hooks/model/useModel';
import {
  IChartTitleData,
  IChartTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import usePanelResize from 'hooks/resize/usePanelResize';
import { ITableRef } from 'types/components/Table/Table';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';
import { useRouteMatch } from 'react-router-dom';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const paramsData = useModel(paramsAppModel);
  const route = useRouteMatch<any>();

  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
  );

  React.useEffect(() => {
    const paramsRequestRef = paramsAppModel.getParamsData();
    paramsAppModel.initialize(route.params.appId);

    paramsRequestRef.call();
    return () => {
      paramsRequestRef.abort();
    };
  }, []);

  React.useEffect(() => {
    if (paramsData?.config?.grouping) {
      paramsAppModel.updateGroupingStateUrl();
    }
  }, [paramsData?.config?.grouping]);

  React.useEffect(() => {
    if (paramsData?.config?.chart) {
      paramsAppModel.updateChartStateUrl();
    }
  }, [paramsData?.config?.chart]);

  React.useEffect(() => {
    if (paramsData?.config?.select) {
      paramsAppModel.updateSelectStateUrl();
    }
  }, [paramsData?.config?.select]);

  return (
    <Params
      tableRef={paramsData?.refs?.tableRef}
      chartPanelRef={paramsData?.refs?.chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      panelResizing={panelResizing}
      highPlotData={paramsData?.highPlotData}
      tableData={paramsData?.tableData}
      tableColumns={paramsData?.tableColumns}
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
      chartTitleData={paramsData?.chartTitleData as IChartTitleData}
      groupingSelectOptions={
        paramsData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      requestIsPending={paramsData?.requestIsPending}
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
      onTableRowHover={paramsAppModel.onTableRowHover}
      onTableRowClick={paramsAppModel.onTableRowClick}
      onExportTableData={paramsAppModel.onExportTableData}
    />
  );
}

export default ParamsContainer;
