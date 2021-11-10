import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { DensityOptions } from 'config/enums/densityEnum';

import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

import correlationsAppModel from 'services/models/correlations/correlationsAppModel';
import projectsModel from 'services/models/projects/projectsModel';
import * as analytics from 'services/analytics';

import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IAggregatedData,
  IAggregationConfig,
  IAlignmentConfig,
  IAppData,
  IChartTitleData,
  IChartTooltip,
  IChartZoom,
  IFocusedState,
  IGroupingSelectOption,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';
import {
  ICorrelationAppConfig,
  ICorrelationAppModelState,
} from 'types/services/models/correlations/correlationsAppModel';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';

import Correlations from './Correlations';

function CorrelationsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const correlationsData =
    useModel<Partial<ICorrelationAppModelState>>(correlationsAppModel);

  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    correlationsData?.config?.table,
    correlationsAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      setComponentRefs<ICorrelationAppModelState>({
        model: correlationsAppModel,
        refElement: {
          tableRef,
          chartPanelRef,
        },
      });
    }
  }, [correlationsData?.rawData]);

  React.useEffect(() => {
    correlationsAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = correlationsAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call().then(() => {
        correlationsAppModel.getMetricsData().call();
      });
    } else {
      correlationsAppModel.setDefaultAppConfigData();
    }
    const correlationsRequestRef = correlationsAppModel.getParamsData();
    correlationsRequestRef.call();
    analytics.pageView('[CorrelationsExplorer]');

    const unListenHistory = history.listen(() => {
      if (!!correlationsData?.config) {
        if (
          correlationsData.config.grouping !== getStateFromUrl('grouping') ||
          correlationsData.config.chart !== getStateFromUrl('chart') ||
          correlationsData.config.select !== getStateFromUrl('select')
        ) {
          correlationsAppModel.setDefaultAppConfigData();
          correlationsAppModel.updateModelData();
        }
      }
    });
    return () => {
      correlationsAppModel.destroy();
      correlationsRequestRef.abort();
      unListenHistory();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  return (
    <Correlations
      // refs
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      // grouping options
      groupingData={
        correlationsData?.config?.grouping as ICorrelationAppConfig['grouping']
      }
      // chart options
      panelResizing={panelResizing}
      scatterPlotData={correlationsData?.scatterPlotData as ILine[][]}
      chartTitleData={correlationsData?.chartTitleData as IChartTitleData}
      ignoreOutliers={
        correlationsData?.config?.chart?.ignoreOutliers as boolean
      }
      tableData={correlationsData?.tableData as IMetricTableRowData[]}
      tableColumns={correlationsData?.tableColumns as ITableColumn[]}
      zoom={correlationsData?.config?.chart?.zoom as IChartZoom}
      highlightMode={
        correlationsData?.config?.chart?.highlightMode as HighlightEnum
      }
      axesScaleType={
        correlationsData?.config?.chart?.axesScaleType as IAxesScaleState
      }
      focusedState={
        correlationsData?.config?.chart?.focusedState as IFocusedState
      }
      notifyData={
        correlationsData?.notifyData as IMetricAppModelState['notifyData']
      }
      tooltip={correlationsData?.config?.chart?.tooltip as IChartTooltip}
      selectedMetricsData={
        correlationsData?.config?.select as IMetricAppConfig['select']
      }
      tableRowHeight={
        correlationsData?.config?.table?.rowHeight as RowHeightSize
      }
      sortFields={correlationsData?.config?.table?.sortFields!}
      hiddenMetrics={correlationsData?.config?.table?.hiddenMetrics!}
      hiddenColumns={correlationsData?.config?.table?.hiddenColumns!}
      groupingSelectOptions={
        correlationsData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      projectsDataMetrics={
        projectsData?.metrics as IProjectParamsMetrics['metrics']
      }
      requestIsPending={correlationsData?.requestIsPending as boolean}
      resizeMode={correlationsData?.config?.table?.resizeMode as ResizeModeEnum}
      columnsWidths={correlationsData?.config?.table?.columnsWidths!}
      // methods
      onChangeTooltip={correlationsAppModel.onChangeTooltip}
      onIgnoreOutliersChange={correlationsAppModel.onIgnoreOutliersChange}
      onZoomChange={correlationsAppModel.onZoomChange}
      onHighlightModeChange={correlationsAppModel.onHighlightModeChange}
      onTableRowHover={correlationsAppModel.onTableRowHover}
      onTableRowClick={correlationsAppModel.onTableRowClick}
      updateColumnsWidths={correlationsAppModel.updateColumnsWidths}
      onAxesScaleTypeChange={correlationsAppModel.onAxesScaleTypeChange}
      onGroupingSelectChange={correlationsAppModel.onGroupingSelectChange}
      onGroupingModeChange={correlationsAppModel.onGroupingModeChange}
      onGroupingPaletteChange={correlationsAppModel.onGroupingPaletteChange}
      onGroupingReset={correlationsAppModel.onGroupingReset}
      onActivePointChange={correlationsAppModel.onActivePointChange}
      onGroupingApplyChange={correlationsAppModel.onGroupingApplyChange}
      onGroupingPersistenceChange={
        correlationsAppModel.onGroupingPersistenceChange
      }
      onBookmarkCreate={correlationsAppModel.onBookmarkCreate}
      onBookmarkUpdate={correlationsAppModel.onBookmarkUpdate}
      onNotificationAdd={correlationsAppModel.onNotificationAdd}
      onNotificationDelete={correlationsAppModel.onNotificationDelete}
      onResetConfigData={correlationsAppModel.onResetConfigData}
      onMetricsSelectChange={correlationsAppModel.onMetricsSelectChange}
      onSelectRunQueryChange={correlationsAppModel.onSelectRunQueryChange}
      onSelectAdvancedQueryChange={
        correlationsAppModel.onSelectAdvancedQueryChange
      }
      toggleSelectAdvancedMode={correlationsAppModel.toggleSelectAdvancedMode}
      onExportTableData={correlationsAppModel.onExportTableData}
      onRowHeightChange={correlationsAppModel.onRowHeightChange}
      onSortChange={correlationsAppModel.onSortChange}
      onSortReset={correlationsAppModel.onSortReset}
      onMetricVisibilityChange={correlationsAppModel.onMetricVisibilityChange}
      onColumnsOrderChange={correlationsAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={correlationsAppModel.onColumnsVisibilityChange}
      onTableDiffShow={correlationsAppModel.onTableDiffShow}
      onTableResizeModeChange={correlationsAppModel.onTableResizeModeChange}
      // live update
      liveUpdateConfig={correlationsAppModel.config?.liveUpdate}
      onLiveUpdateConfigChange={correlationsAppModel.changeLiveUpdateConfig}
      onShuffleChange={correlationsAppModel.onShuffleChange}
      onSearchQueryCopy={correlationsAppModel.onSearchQueryCopy}
    />
  );
}

export default CorrelationsContainer;
