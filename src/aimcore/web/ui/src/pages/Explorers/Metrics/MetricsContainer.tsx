import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useResizeObserver, useModel, usePanelResize } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import metricAppModel from 'services/models/metrics/metricsAppModel';
import * as analytics from 'services/analytics';
import { AppNameEnum } from 'services/models/explorer';

import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IMetricAppModelState } from 'types/services/models/metrics/metricsAppModel';
import { IApiRequest } from 'types/services/services';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';
import exceptionHandler from 'utils/app/exceptionHandler';

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
  const [chartPanelOffsetHeight, setChartPanelOffsetHeight] = React.useState(
    chartElemRef?.current?.offsetHeight,
  );

  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    metricsData?.config?.table || undefined,
    metricAppModel.onTableResizeEnd,
  );

  useResizeObserver(() => {
    if (chartElemRef?.current?.offsetHeight !== chartPanelOffsetHeight) {
      setChartPanelOffsetHeight(chartElemRef?.current?.offsetHeight);
    }
  }, chartElemRef);

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      setComponentRefs({
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
    let appRequestRef: IApiRequest<void>;
    let metricsRequestRef: IApiRequest<void>;
    if (route.params.appId) {
      appRequestRef = metricAppModel.getAppConfigData(route.params.appId);
      appRequestRef
        .call((detail: any) => {
          exceptionHandler({ detail, model: metricAppModel });
        })
        .then(() => {
          metricAppModel.setDefaultAppConfigData(false);
          metricsRequestRef = metricAppModel.getMetricsData();
          metricsRequestRef.call((detail: any) => {
            exceptionHandler({ detail, model: metricAppModel });
          });
        });
    } else {
      metricAppModel.setDefaultAppConfigData();
      metricsRequestRef = metricAppModel.getMetricsData();
      metricsRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model: metricAppModel });
      });
    }
    analytics.pageView(ANALYTICS_EVENT_KEYS.metrics.pageView);

    const unListenHistory = history.listen(() => {
      if (!!metricsData?.config) {
        if (
          (metricsData.config.grouping !== getStateFromUrl('grouping') ||
            metricsData.config.chart !== getStateFromUrl('chart') ||
            metricsData.config.select !== getStateFromUrl('select')) &&
          history.location.pathname === `/${AppNameEnum.METRICS}`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ErrorBoundary>
      <Metrics
        // refs
        tableRef={tableRef}
        chartPanelRef={chartPanelRef}
        tableElemRef={tableElemRef}
        chartElemRef={chartElemRef}
        wrapperElemRef={wrapperElemRef}
        resizeElemRef={resizeElemRef}
        // grouping options
        groupingData={metricsData?.config?.grouping!}
        // chart options
        panelResizing={panelResizing}
        lineChartData={metricsData?.lineChartData!}
        chartTitleData={metricsData?.chartTitleData!}
        legendsData={metricsData?.legendsData!}
        ignoreOutliers={metricsData?.config?.chart?.ignoreOutliers!}
        legends={metricsData?.config?.chart?.legends!}
        tableData={metricsData?.tableData!}
        sameValueColumns={metricsData?.sameValueColumns!}
        tableColumns={metricsData?.tableColumns!}
        aggregatedData={metricsData?.aggregatedData!}
        zoom={metricsData?.config?.chart?.zoom!}
        highlightMode={metricsData?.config?.chart?.highlightMode!}
        axesScaleType={metricsData?.config?.chart?.axesScaleType!}
        axesScaleRange={metricsData?.config?.chart?.axesScaleRange!}
        smoothing={metricsData?.config?.chart?.smoothing!}
        focusedState={metricsData?.config?.chart?.focusedState!}
        notifyData={metricsData?.notifyData!}
        tooltip={metricsData?.tooltip!}
        aggregationConfig={metricsData?.config?.chart?.aggregationConfig!}
        alignmentConfig={metricsData?.config?.chart?.alignmentConfig!}
        densityType={metricsData?.config?.chart?.densityType!}
        selectedMetricsData={metricsData?.config?.select!}
        tableRowHeight={metricsData?.config?.table?.rowHeight!}
        sortFields={metricsData?.config?.table?.sortFields!}
        hiddenMetrics={metricsData?.config?.table?.hiddenMetrics!}
        hideSystemMetrics={metricsData?.config?.table?.hideSystemMetrics!}
        hiddenColumns={metricsData?.config?.table?.hiddenColumns!}
        chartPanelOffsetHeight={chartPanelOffsetHeight}
        selectedRows={metricsData?.selectedRows!}
        groupingSelectOptions={metricsData?.groupingSelectOptions!}
        sortOptions={metricsData?.sortOptions!}
        resizeMode={metricsData?.config?.table?.resizeMode!}
        columnsWidths={metricsData?.config?.table?.columnsWidths!}
        requestStatus={metricsData?.requestStatus!}
        requestProgress={metricsData?.requestProgress!}
        selectFormData={metricsData?.selectFormData!}
        columnsOrder={metricsData?.config?.table?.columnsOrder!}
        // methods
        onChangeTooltip={metricAppModel.onChangeTooltip}
        onRunsTagsChange={metricAppModel.onRunsTagsChange}
        onIgnoreOutliersChange={metricAppModel.onIgnoreOutliersChange}
        onLegendsChange={metricAppModel.onLegendsChange}
        onZoomChange={metricAppModel.onZoomChange}
        onHighlightModeChange={metricAppModel.onHighlightModeChange}
        onSmoothingChange={metricAppModel.onSmoothingChange}
        onTableRowHover={metricAppModel.onTableRowHover}
        onTableRowClick={metricAppModel.onTableRowClick}
        updateColumnsWidths={metricAppModel.updateColumnsWidths}
        onAxesScaleTypeChange={metricAppModel.onAxesScaleTypeChange}
        onAxesScaleRangeChange={metricAppModel.onAxesScaleRangeChange}
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
        onRowsVisibilityChange={metricAppModel.onRowsVisibilityChange}
        // live update
        liveUpdateConfig={metricsData?.config?.liveUpdate!}
        onLiveUpdateConfigChange={metricAppModel.changeLiveUpdateConfig}
        onShuffleChange={metricAppModel.onShuffleChange}
        onSearchQueryCopy={metricAppModel.onSearchQueryCopy}
        onRowSelect={metricAppModel.onRowSelect}
        archiveRuns={metricAppModel.archiveRuns}
        deleteRuns={metricAppModel.deleteRuns}
      />
    </ErrorBoundary>
  );
}

export default MetricsContainer;
