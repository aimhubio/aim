import React from 'react';
import _ from 'lodash-es';

import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import TableLoader from 'components/TableLoader/TableLoader';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Grouping from 'components/Grouping/Grouping';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import GroupingPopovers from 'config/grouping/GroupingPopovers';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import {
  IllustrationsEnum,
  Request_Illustrations,
} from 'config/illustrationConfig/illustrationConfig';

import { AppNameEnum } from 'services/models/explorer';

import { ILine } from 'types/components/LineChart/LineChart';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import { ChartTypeEnum } from 'utils/d3';

import MetricsBar from './components/MetricsBar/MetricsBar';
import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';

import './Metrics.scss';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  const chartProps: any[] = React.useMemo(() => {
    return (props.lineChartData || []).map(
      (chartData: ILine[], index: number) => ({
        axesScaleType: props.axesScaleType,
        curveInterpolation: props.curveInterpolation,
        ignoreOutliers: props.ignoreOutliers,
        highlightMode: props.highlightMode,
        aggregatedData: props.aggregatedData?.filter(
          (data) => data.chartIndex === index,
        ),
        zoom: props.zoom,
        chartTitle: props.chartTitleData[index],
        aggregationConfig: props.aggregationConfig,
        alignmentConfig: props.alignmentConfig,
        onZoomChange: props.onZoomChange,
      }),
    );
  }, [
    props.lineChartData,
    props.axesScaleType,
    props.curveInterpolation,
    props.ignoreOutliers,
    props.highlightMode,
    props.zoom,
    props.chartTitleData,
    props.aggregatedData,
    props.aggregationConfig,
    props.alignmentConfig,
    props.onZoomChange,
  ]);

  return (
    <ErrorBoundary>
      <div ref={props.wrapperElemRef} className='Metrics__container'>
        <section className='Metrics__section'>
          <div className='Metrics__section__div Metrics__fullHeight'>
            <MetricsBar
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
              liveUpdateConfig={props.liveUpdateConfig}
              onLiveUpdateConfigChange={props.onLiveUpdateConfigChange}
              title={'Metrics explorer'}
            />
            <div className='Metrics__SelectForm__Grouping__container'>
              <SelectForm
                requestIsPending={
                  props.requestStatus === RequestStatusEnum.Pending
                }
                selectFormData={props.selectFormData}
                selectedMetricsData={props.selectedMetricsData}
                onMetricsSelectChange={props.onMetricsSelectChange}
                onSelectRunQueryChange={props.onSelectRunQueryChange}
                onSelectAdvancedQueryChange={props.onSelectAdvancedQueryChange}
                toggleSelectAdvancedMode={props.toggleSelectAdvancedMode}
                onSearchQueryCopy={props.onSearchQueryCopy}
              />
              <Grouping
                groupingPopovers={GroupingPopovers.filter(
                  (p) =>
                    p.groupName === 'color' ||
                    p.groupName === 'stroke' ||
                    p.groupName === 'chart',
                )}
                groupingData={props.groupingData}
                groupingSelectOptions={props.groupingSelectOptions}
                onGroupingSelectChange={props.onGroupingSelectChange}
                onGroupingModeChange={props.onGroupingModeChange}
                onGroupingPaletteChange={props.onGroupingPaletteChange}
                onGroupingReset={props.onGroupingReset}
                onGroupingApplyChange={props.onGroupingApplyChange}
                onGroupingPersistenceChange={props.onGroupingPersistenceChange}
                onShuffleChange={props.onShuffleChange}
              />
            </div>
            <div
              ref={props.chartElemRef}
              className={`Metrics__chart__container${
                props.resizeMode === ResizeModeEnum.MaxHeight
                  ? '__hide'
                  : props.requestStatus !== RequestStatusEnum.Pending &&
                    _.isEmpty(props.tableData)
                  ? '__fullHeight'
                  : ''
              }`}
            >
              <BusyLoaderWrapper
                height='100%'
                className='Metrics__loader'
                isLoading={props.requestStatus === RequestStatusEnum.Pending}
                loaderComponent={<ChartLoader controlsCount={10} />}
              >
                {!_.isEmpty(props.tableData) ? (
                  <ChartPanel
                    key={props.lineChartData?.length}
                    ref={props.chartPanelRef}
                    chartPanelOffsetHeight={props.chartPanelOffsetHeight}
                    panelResizing={props.panelResizing}
                    chartType={ChartTypeEnum.LineChart}
                    data={props.lineChartData}
                    focusedState={props.focusedState}
                    tooltip={props.tooltip}
                    alignmentConfig={props.alignmentConfig}
                    zoom={props.zoom}
                    onActivePointChange={props.onActivePointChange}
                    chartProps={chartProps}
                    resizeMode={props.resizeMode}
                    controls={
                      <Controls
                        data={props.lineChartData}
                        chartType={ChartTypeEnum.LineChart}
                        chartProps={chartProps}
                        selectOptions={props.groupingSelectOptions}
                        tooltip={props.tooltip}
                        smoothingAlgorithm={props.smoothingAlgorithm}
                        smoothingFactor={props.smoothingFactor}
                        curveInterpolation={props.curveInterpolation}
                        densityType={props.densityType}
                        ignoreOutliers={props.ignoreOutliers}
                        zoom={props.zoom}
                        highlightMode={props.highlightMode}
                        aggregationConfig={props.aggregationConfig}
                        axesScaleType={props.axesScaleType}
                        alignmentConfig={props.alignmentConfig}
                        onChangeTooltip={props.onChangeTooltip}
                        onIgnoreOutliersChange={props.onIgnoreOutliersChange}
                        onZoomChange={props.onZoomChange}
                        onHighlightModeChange={props.onHighlightModeChange}
                        onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                        onSmoothingChange={props.onSmoothingChange}
                        onAggregationConfigChange={
                          props.onAggregationConfigChange
                        }
                        onDensityTypeChange={props.onDensityTypeChange}
                        onAlignmentTypeChange={props.onAlignmentTypeChange}
                        onAlignmentMetricChange={props.onAlignmentMetricChange}
                        selectFormOptions={props.selectFormData.options}
                      />
                    }
                  />
                ) : (
                  props.selectFormData.options !== undefined && (
                    <IllustrationBlock
                      size='xLarge'
                      page='metrics'
                      type={
                        props.selectFormData.options?.length
                          ? Request_Illustrations[props.requestStatus]
                          : IllustrationsEnum.EmptyData
                      }
                    />
                  )
                )}
              </BusyLoaderWrapper>
            </div>
            <ResizePanel
              className={`Metrics__ResizePanel${
                _.isEmpty(props.tableData) &&
                props.requestStatus !== RequestStatusEnum.Pending
                  ? '__hide'
                  : ''
              }`}
              panelResizing={props.panelResizing}
              resizeElemRef={props.resizeElemRef}
              resizeMode={props.resizeMode}
              onTableResizeModeChange={props.onTableResizeModeChange}
            />
            <div
              ref={props.tableElemRef}
              className={`Metrics__table__container${
                props.requestStatus !== RequestStatusEnum.Pending &&
                (props.resizeMode === ResizeModeEnum.Hide ||
                  _.isEmpty(props.tableData))
                  ? '__hide'
                  : ''
              }`}
            >
              <BusyLoaderWrapper
                isLoading={props.requestStatus === RequestStatusEnum.Pending}
                className='Metrics__loader'
                height='100%'
                loaderComponent={<TableLoader />}
              >
                {!_.isEmpty(props.tableData) ? (
                  <ErrorBoundary>
                    <Table
                      // deletable
                      custom
                      ref={props.tableRef}
                      data={props.tableData}
                      columns={props.tableColumns}
                      // Table options
                      multiSelect
                      topHeader
                      groups={!Array.isArray(props.tableData)}
                      rowHeight={props.tableRowHeight}
                      rowHeightMode={
                        props.tableRowHeight === RowHeightSize.sm
                          ? 'small'
                          : props.tableRowHeight === RowHeightSize.md
                          ? 'medium'
                          : 'large'
                      }
                      sortOptions={props.groupingSelectOptions}
                      sortFields={props.sortFields}
                      hiddenRows={props.hiddenMetrics}
                      hiddenColumns={props.hiddenColumns}
                      resizeMode={props.resizeMode}
                      columnsWidths={props.columnsWidths}
                      selectedRows={props.selectedRows}
                      hideSystemMetrics={props.hideSystemMetrics}
                      appName={AppNameEnum.METRICS}
                      hiddenChartRows={props.lineChartData?.length === 0}
                      columnsOrder={props.columnsOrder}
                      // Table actions
                      onSort={props.onSortChange}
                      onSortReset={props.onSortReset}
                      onExport={props.onExportTableData}
                      onManageColumns={props.onColumnsOrderChange}
                      onColumnsVisibilityChange={
                        props.onColumnsVisibilityChange
                      }
                      onTableDiffShow={props.onTableDiffShow}
                      onRowHeightChange={props.onRowHeightChange}
                      onRowsChange={props.onMetricVisibilityChange}
                      onRowHover={props.onTableRowHover}
                      onRowClick={props.onTableRowClick}
                      onTableResizeModeChange={props.onTableResizeModeChange}
                      updateColumnsWidths={props.updateColumnsWidths}
                      onRowSelect={props.onRowSelect}
                      archiveRuns={props.archiveRuns}
                      deleteRuns={props.deleteRuns}
                      focusedState={props.focusedState}
                    />
                  </ErrorBoundary>
                ) : null}
              </BusyLoaderWrapper>
            </div>
          </div>
        </section>
        {props.notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={props.onNotificationDelete}
            data={props.notifyData}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Metrics);
