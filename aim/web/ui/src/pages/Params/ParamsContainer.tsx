import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';

import Params from './Params';
import paramsAppModel from 'services/models/params/paramsAppModel';
import useModel from 'hooks/model/useModel';
import {
  IChartTitleData,
  IChartTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import usePanelResize from 'hooks/resize/usePanelResize';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';
import { RowHeightSize } from 'config/table/tableConfigs';
import * as analytics from 'services/analytics';
import getStateFromUrl from 'utils/getStateFromUrl';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const paramsData = useModel<any>(paramsAppModel);
  const route = useRouteMatch<any>();
  const history = useHistory();

  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    paramsData?.config?.table || {},
    paramsAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    let appRequestRef: {
      call: () => Promise<any>;
      abort: () => void;
    };
    const paramsRequestRef: {
      call: () => Promise<any>;
      abort: () => void;
    } = paramsAppModel.getParamsData();
    paramsAppModel.initialize(route.params.appId);

    if (route.params.appId) {
      appRequestRef = paramsAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call().then(() => {
        paramsAppModel.getParamsData().call();
      });
    } else {
      paramsAppModel.setDefaultAppConfigData();
    }
    const unListenHistory = history.listen(() => {
      if (!!paramsData.config) {
        if (
          paramsData.config.grouping !== getStateFromUrl('grouping') ||
          paramsData.config.chart !== getStateFromUrl('chart') ||
          paramsData.config.select !== getStateFromUrl('select')
        ) {
          paramsAppModel.setDefaultAppConfigData();
          paramsAppModel.updateModelData();
        }
      }
    });
    analytics.pageView('[ParamsExplorer]');
    paramsRequestRef.call();
    return () => {
      paramsAppModel.destroy();
      paramsRequestRef.abort();
      unListenHistory();
      appRequestRef?.abort();
    };
  }, []);

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
      requestIsPending={paramsData?.requestIsPending}
      isVisibleColorIndicator={
        paramsData?.config?.chart?.isVisibleColorIndicator
      }
      groupingData={
        paramsData?.config?.grouping as IParamsAppConfig['grouping']
      }
      selectedParamsData={
        paramsData?.config?.select as IParamsAppConfig['select']
      }
      sortFields={paramsData?.config?.table?.sortFields!}
      curveInterpolation={paramsData?.config?.chart?.curveInterpolation}
      tooltip={paramsData?.config?.chart?.tooltip as IChartTooltip}
      chartTitleData={paramsData?.chartTitleData as IChartTitleData}
      groupingSelectOptions={
        paramsData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      hiddenColumns={paramsData?.config?.table?.hiddenColumns!}
      resizeMode={paramsData?.config?.table?.resizeMode}
      hiddenMetrics={paramsData?.config?.table?.hiddenMetrics!}
      notifyData={paramsData?.notifyData}
      tableRowHeight={paramsData?.config?.table?.rowHeight as RowHeightSize}
      columnsWidths={paramsData?.config?.table?.columnsWidths}
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
      updateColumnsWidths={paramsAppModel.updateColumnsWidths}
      onNotificationDelete={paramsAppModel.onNotificationDelete}
      onResetConfigData={paramsAppModel.onResetConfigData}
      onChangeTooltip={paramsAppModel.onChangeTooltip}
      onTableRowHover={paramsAppModel.onTableRowHover}
      onTableRowClick={paramsAppModel.onTableRowClick}
      onExportTableData={paramsAppModel.onExportTableData}
      onRowHeightChange={paramsAppModel.onRowHeightChange}
      onParamVisibilityChange={paramsAppModel.onParamVisibilityChange}
      onColumnsOrderChange={paramsAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={paramsAppModel.onColumnsVisibilityChange}
      onTableResizeModeChange={paramsAppModel.onTableResizeModeChange}
      onTableDiffShow={paramsAppModel.onTableDiffShow}
      onSortReset={paramsAppModel.onSortReset}
      onSortFieldsChange={paramsAppModel.onSortChange}
      onShuffleChange={paramsAppModel.onShuffleChange}
      liveUpdateConfig={paramsData.config?.liveUpdate}
      onLiveUpdateConfigChange={paramsAppModel.changeLiveUpdateConfig}
    />
  );
}

export default ParamsContainer;
