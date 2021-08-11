import React from 'react';

import Metrics from './Metrics';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import { ITableRef } from 'types/components/Table/Table';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { CurveEnum } from 'utils/d3';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import metricAppModel from 'services/models/metrics/metricsAppModel';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import {
  IMetricAppConfig,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

const metricsRequestRef = metricAppModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);

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
    metricsRequestRef.call();
    return () => {
      metricsRequestRef.abort();
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
      tableData={metricsData?.tableData as IMetricTableRowData[][]}
      tableColumns={metricsData?.tableColumns as ITableColumn[]}
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
      //methods
      onDisplayOutliersChange={metricAppModel.onDisplayOutliersChange}
      onZoomModeChange={metricAppModel.onZoomModeChange}
      onChangeHighlightMode={metricAppModel.onChangeHighlightMode}
      onSmoothingChange={metricAppModel.onSmoothingChange}
      onTableRowHover={metricAppModel.onTableRowHover}
      onTableRowClick={metricAppModel.onTableRowClick}
      onAxesScaleTypeChange={metricAppModel.onAxesScaleTypeChange}
      onGroupingSelectChange={metricAppModel.onGroupingSelectChange}
      onGroupingModeChange={metricAppModel.onGroupingModeChange}
      onGroupingPaletteChange={metricAppModel.onGroupingPaletteChange}
      onGroupingReset={metricAppModel.onGroupingReset}
      onActivePointChange={metricAppModel.onActivePointChange}
      onGroupingApplyChange={metricAppModel.onGroupingApplyChange}
      onGroupingPersistenceChange={metricAppModel.onGroupingPersistenceChange}
      onBookmarkCreate={metricAppModel.onBookmarkCreate}
    />
  );
}

export default MetricsContainer;
