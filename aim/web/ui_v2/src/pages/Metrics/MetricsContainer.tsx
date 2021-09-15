import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import Metrics from './Metrics';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { CurveEnum } from 'utils/d3';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import metricAppModel from 'services/models/metrics/metricsAppModel';
import projectsModel from 'services/models/projects/projectsModel';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import {
  IAggregatedData,
  IAggregationConfig,
  IAlignmentConfig,
  IAppData,
  IChartTooltip,
  IGroupingSelectOption,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricTableRowData,
  IChartTitleData,
  IChartZoom,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { RowHeightSize } from 'config/table/tableConfigs';
import {
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';
import { ResizeModeEnum } from 'config/enums/tableEnums';

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const metricsData = useModel<Partial<IMetricAppModelState> | any>(
    metricAppModel,
  );
  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    metricsData?.config?.table.resizeMode || ResizeModeEnum.Resizable,
  );

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      metricAppModel.setComponentRefs({
        tableRef,
        chartPanelRef,
      });
    }
  }, [metricsData?.rawData]);

  React.useEffect(() => {
    metricAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = metricAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call();
    }
    metricAppModel.setDefaultAppConfigData();

    const metricsRequestRef = metricAppModel.getMetricsData();
    metricsRequestRef.call();
    return () => {
      metricsRequestRef.abort();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  React.useEffect(() => {
    if (metricsData?.config?.grouping) {
      metricAppModel.updateGroupingStateUrl();
    }
  }, [metricsData?.config?.grouping]);

  React.useEffect(() => {
    if (metricsData?.config?.chart) {
      metricAppModel.updateChartStateUrl();
    }
  }, [metricsData?.config?.chart]);

  React.useEffect(() => {
    if (metricsData?.config?.select) {
      metricAppModel.updateSelectStateUrl();
    }
  }, [metricsData?.config?.select]);

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
      groupingData={
        metricsData?.config?.grouping as IMetricAppConfig['grouping']
      }
      // chart options
      panelResizing={panelResizing}
      lineChartData={metricsData?.lineChartData as ILine[][]}
      chartTitleData={metricsData?.chartTitleData as IChartTitleData}
      displayOutliers={metricsData?.config?.chart.displayOutliers as boolean}
      tableData={metricsData?.tableData as IMetricTableRowData[]}
      tableColumns={metricsData?.tableColumns as ITableColumn[]}
      aggregatedData={metricsData?.aggregatedData as IAggregatedData[]}
      zoom={metricsData?.config?.chart.zoom as IChartZoom}
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
      smoothingFactor={metricsData?.config?.chart.smoothingFactor as number}
      focusedState={metricsData?.config?.chart.focusedState as IFocusedState}
      notifyData={metricsData?.notifyData as IMetricAppModelState['notifyData']}
      tooltip={metricsData?.config?.chart?.tooltip as IChartTooltip}
      aggregationConfig={
        metricsData?.config?.chart.aggregationConfig as IAggregationConfig
      }
      alignmentConfig={
        metricsData?.config?.chart.alignmentConfig as IAlignmentConfig
      }
      selectedMetricsData={
        metricsData?.config?.select as IMetricAppConfig['select']
      }
      tableRowHeight={metricsData?.config?.table.rowHeight as RowHeightSize}
      sortFields={metricsData?.config?.table.sortFields!}
      hiddenMetrics={metricsData?.config?.table.hiddenMetrics!}
      hiddenColumns={metricsData?.config?.table.hiddenColumns!}
      groupingSelectOptions={
        metricsData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      projectsDataMetrics={
        projectsData?.metrics as IProjectParamsMetrics['metrics']
      }
      requestIsPending={
        metricsData?.requestIsPending === undefined
          ? true
          : metricsData?.requestIsPending
      }
      resizeMode={metricsData?.config?.table.resizeMode as ResizeModeEnum}
      //methods
      onChangeTooltip={metricAppModel.onChangeTooltip}
      onDisplayOutliersChange={metricAppModel.onDisplayOutliersChange}
      onZoomChange={metricAppModel.onZoomChange}
      onHighlightModeChange={metricAppModel.onHighlightModeChange}
      onSmoothingChange={metricAppModel.onSmoothingChange}
      onTableRowHover={metricAppModel.onTableRowHover}
      onTableRowClick={metricAppModel.onTableRowClick}
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
      onMetricsSelectChange={metricAppModel.onMetricsSelectChange}
      onSelectRunQueryChange={metricAppModel.onSelectRunQueryChange}
      onSelectAdvancedQueryChange={metricAppModel.onSelectAdvancedQueryChange}
      toggleSelectAdvancedMode={metricAppModel.toggleSelectAdvancedMode}
      onExportTableData={metricAppModel.onExportTableData}
      onRowHeightChange={metricAppModel.onRowHeightChange}
      onSortFieldsChange={metricAppModel.onSortFieldsChange}
      onMetricVisibilityChange={metricAppModel.onMetricVisibilityChange}
      onColumnsOrderChange={metricAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={metricAppModel.onColumnsVisibilityChange}
      onTableDiffShow={metricAppModel.onTableDiffShow}
      onTableResizeModeChange={metricAppModel.onTableResizeModeChange}
    />
  );
}

export default MetricsContainer;
