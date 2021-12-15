import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { DensityOptions } from 'config/enums/densityEnum';

import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

import metricAppModel from 'services/models/metrics/metricsAppModel';
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
  IPanelTooltip,
  IChartZoom,
  IFocusedState,
  IGroupingSelectOption,
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
  IGroupingConfig,
  ISelectConfig,
} from 'types/services/models/explorer/createAppModel';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { CurveEnum } from 'utils/d3';
import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';

import Metrics from './Metrics';

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const metricsData = useModel<Partial<IMetricAppModelState>>(metricAppModel);

  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    metricsData?.config?.table || {},
    metricAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      setComponentRefs<IMetricAppModelState>({
        model: metricAppModel,
        refElement: {
          tableRef,
          chartPanelRef,
        },
      });
    }
  }, [metricsData?.rawData]);

  React.useEffect(() => {
    metricAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    let metricsRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = metricAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call().then(() => {
        metricsRequestRef = metricAppModel.getMetricsData();
        metricsRequestRef.call();
      });
    } else {
      metricAppModel.setDefaultAppConfigData();
      metricsRequestRef = metricAppModel.getMetricsData();
      metricsRequestRef.call();
    }
    analytics.pageView('[MetricsExplorer]');

    const unListenHistory = history.listen(() => {
      if (!!metricsData?.config) {
        if (
          metricsData.config.grouping !== getStateFromUrl('grouping') ||
          metricsData.config.chart !== getStateFromUrl('chart') ||
          metricsData.config.select !== getStateFromUrl('select')
        ) {
          metricAppModel.setDefaultAppConfigData();
          metricAppModel.updateModelData();
        }
      }
    });
    return () => {
      metricAppModel.destroy();
      metricsRequestRef?.abort();
      unListenHistory();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  return (
    <Metrics
      // refs
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      // grouping options
      groupingData={metricsData?.config?.grouping as IGroupingConfig}
      // chart options
      panelResizing={panelResizing}
      lineChartData={metricsData?.lineChartData as ILine[][]}
      chartTitleData={metricsData?.chartTitleData as IChartTitleData}
      ignoreOutliers={metricsData?.config?.chart?.ignoreOutliers as boolean}
      tableData={metricsData?.tableData as IMetricTableRowData[]}
      tableColumns={metricsData?.tableColumns as ITableColumn[]}
      aggregatedData={metricsData?.aggregatedData as IAggregatedData[]}
      zoom={metricsData?.config?.chart?.zoom as IChartZoom}
      curveInterpolation={
        metricsData?.config?.chart.curveInterpolation as CurveEnum
      }
      highlightMode={metricsData?.config?.chart.highlightMode as HighlightEnum}
      axesScaleType={
        metricsData?.config?.chart.axesScaleType as IAxesScaleState
      }
      smoothingAlgorithm={
        metricsData?.config?.chart.smoothingAlgorithm as SmoothingAlgorithmEnum
      }
      smoothingFactor={metricsData?.config?.chart?.smoothingFactor as number}
      focusedState={metricsData?.config?.chart?.focusedState as IFocusedState}
      notifyData={metricsData?.notifyData as IMetricAppModelState['notifyData']}
      tooltip={metricsData?.config?.chart?.tooltip as IPanelTooltip}
      aggregationConfig={
        metricsData?.config?.chart?.aggregationConfig as IAggregationConfig
      }
      alignmentConfig={
        metricsData?.config?.chart?.alignmentConfig as IAlignmentConfig
      }
      densityType={metricsData?.config?.chart.densityType as DensityOptions}
      selectedMetricsData={metricsData?.config?.select as ISelectConfig}
      tableRowHeight={metricsData?.config?.table?.rowHeight as RowHeightSize}
      sortFields={metricsData?.config?.table?.sortFields!}
      hiddenMetrics={metricsData?.config?.table?.hiddenMetrics!}
      hiddenColumns={metricsData?.config?.table?.hiddenColumns!}
      groupingSelectOptions={
        metricsData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      projectsDataMetrics={
        projectsData?.metrics as IProjectParamsMetrics['metric']
      }
      requestIsPending={metricsData?.requestIsPending as boolean}
      resizeMode={metricsData?.config?.table?.resizeMode as ResizeModeEnum}
      columnsWidths={metricsData?.config?.table?.columnsWidths}
      // methods
      onChangeTooltip={metricAppModel.onChangeTooltip}
      onIgnoreOutliersChange={metricAppModel.onIgnoreOutliersChange}
      onZoomChange={metricAppModel.onZoomChange}
      onHighlightModeChange={metricAppModel.onHighlightModeChange}
      onSmoothingChange={metricAppModel.onSmoothingChange}
      onTableRowHover={metricAppModel.onTableRowHover}
      onTableRowClick={metricAppModel.onTableRowClick}
      updateColumnsWidths={metricAppModel.updateColumnsWidths}
      onAxesScaleTypeChange={metricAppModel.onAxesScaleTypeChange}
      onAggregationConfigChange={metricAppModel.onAggregationConfigChange}
      onGroupingSelectChange={metricAppModel.onGroupingSelectChange}
      onGroupingModeChange={metricAppModel.onGroupingModeChange}
      onGroupingPaletteChange={metricAppModel.onGroupingPaletteChange}
      onGroupingReset={metricAppModel.onGroupingReset}
      onActivePointChange={metricAppModel.onActivePointChange}
      onGroupingApplyChange={metricAppModel.onGroupingApplyChange}
      onGroupingPersistenceChange={metricAppModel.onGroupingPersistenceChange}
      onBookmarkCreate={metricAppModel.onBookmarkCreate}
      onBookmarkUpdate={metricAppModel.onBookmarkUpdate}
      onNotificationAdd={metricAppModel.onNotificationAdd}
      onNotificationDelete={metricAppModel.onNotificationDelete}
      onResetConfigData={metricAppModel.onResetConfigData}
      onAlignmentMetricChange={metricAppModel.onAlignmentMetricChange}
      onAlignmentTypeChange={metricAppModel.onAlignmentTypeChange}
      onDensityTypeChange={metricAppModel.onDensityTypeChange}
      onMetricsSelectChange={metricAppModel.onMetricsSelectChange}
      onSelectRunQueryChange={metricAppModel.onSelectRunQueryChange}
      onSelectAdvancedQueryChange={metricAppModel.onSelectAdvancedQueryChange}
      toggleSelectAdvancedMode={metricAppModel.toggleSelectAdvancedMode}
      onExportTableData={metricAppModel.onExportTableData}
      onRowHeightChange={metricAppModel.onRowHeightChange}
      onSortChange={metricAppModel.onSortChange}
      onSortReset={metricAppModel.onSortReset}
      onMetricVisibilityChange={metricAppModel.onMetricVisibilityChange}
      onColumnsOrderChange={metricAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={metricAppModel.onColumnsVisibilityChange}
      onTableDiffShow={metricAppModel.onTableDiffShow}
      onTableResizeModeChange={metricAppModel.onTableResizeModeChange}
      // live update
      liveUpdateConfig={metricsData?.config?.liveUpdate}
      onLiveUpdateConfigChange={metricAppModel.changeLiveUpdateConfig}
      onShuffleChange={metricAppModel.onShuffleChange}
      onSearchQueryCopy={metricAppModel.onSearchQueryCopy}
    />
  );
}

export default MetricsContainer;
