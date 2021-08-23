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
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import {
  IAggregatedData,
  IAggregationConfig,
  IAlignmentConfig,
  IAppData,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricTableRowData,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const metricsData = useModel(metricAppModel);
  usePanelResize(wrapperElemRef, chartElemRef, tableElemRef, resizeElemRef);

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      metricAppModel.setComponentRefs({
        tableRef,
        chartPanelRef,
      });
    }
  }, [metricsData?.rawData]);

  React.useEffect(() => {
    metricAppModel.initialize();
    const metricsRequestRef = metricAppModel.getMetricsData();
    let appRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = metricAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call();
    }
    metricAppModel.setDefaultAppConfigData();
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
      //refs
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      //options
      lineChartData={metricsData?.lineChartData as ILine[][]}
      displayOutliers={metricsData?.config?.chart.displayOutliers as boolean}
      tableData={metricsData?.tableData as IMetricTableRowData[]}
      tableColumns={metricsData?.tableColumns as ITableColumn[]}
      aggregatedData={metricsData?.aggregatedData as IAggregatedData[]}
      zoomMode={metricsData?.config?.chart.zoomMode as boolean}
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
      groupingData={
        metricsData?.config?.grouping as IMetricAppConfig['grouping']
      }
      focusedState={metricsData?.config?.chart.focusedState as IFocusedState}
      notifyData={metricsData?.notifyData as IMetricAppModelState['notifyData']}
      tooltipContent={metricsData?.tooltipContent as ITooltipContent}
      aggregationConfig={
        metricsData?.config?.chart.aggregationConfig as IAggregationConfig
      }
      alignmentConfig={
        metricsData?.config?.chart.alignmentConfig as IAlignmentConfig
      }
      selectedMetricsData={
        metricsData?.config?.select.metrics as ISelectMetricsOption[]
      }
      //methods
      onDisplayOutliersChange={metricAppModel.onDisplayOutliersChange}
      onZoomModeChange={metricAppModel.onZoomModeChange}
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
    />
  );
}

export default MetricsContainer;
