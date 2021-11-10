import React from 'react';
import { isEmpty } from 'lodash-es';

import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import TableLoader from 'components/TableLoader/TableLoader';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import ResizePanel from 'components/ResizePanel/ResizePanel';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';

import Grouping from 'pages/components/Grouping/Grouping';
import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import Controls from 'pages/Correlations/components/Controls/Controls';
import SelectForm from 'pages/Correlations/components/SelectForm/SelectForm';

import { ILine } from 'types/components/LineChart/LineChart';
import { ICorrelationsProps } from 'types/pages/correlations/Correlations';

import { ChartTypeEnum } from 'utils/d3';

function Correlations(
  props: ICorrelationsProps,
): React.FunctionComponentElement<React.ReactNode> {
  const chartProps: any[] = React.useMemo(() => {
    return (props.scatterPlotData || []).map(
      (chartData: ILine[], index: number) => ({
        axesScaleType: props.axesScaleType,
        ignoreOutliers: props.ignoreOutliers,
        highlightMode: props.highlightMode,
        zoom: props.zoom,
        chartTitle: props.chartTitleData[index],
        onZoomChange: props.onZoomChange,
      }),
    );
  }, [
    props.scatterPlotData,
    props.axesScaleType,
    props.ignoreOutliers,
    props.highlightMode,
    props.zoom,
    props.chartTitleData,
    props.onZoomChange,
  ]);

  return (
    <div ref={props.wrapperElemRef} className='Correlations__container'>
      <section className='Correlations__section'>
        <div className='Correlations__section__div Metrics__fullHeight'>
          <AppBar
            onBookmarkCreate={props.onBookmarkCreate}
            onBookmarkUpdate={props.onBookmarkUpdate}
            onResetConfigData={props.onResetConfigData}
            liveUpdateConfig={props.liveUpdateConfig}
            onLiveUpdateConfigChange={props.onLiveUpdateConfigChange}
            title={'Correlations explorer'}
          />
          <div className='Correlations__SelectForm__Grouping__container'>
            <SelectForm
              selectedMetricsData={props.selectedMetricsData}
              onMetricsSelectChange={props.onMetricsSelectChange}
              onSelectRunQueryChange={props.onSelectRunQueryChange}
              onSelectAdvancedQueryChange={props.onSelectAdvancedQueryChange}
              toggleSelectAdvancedMode={props.toggleSelectAdvancedMode}
              onSearchQueryCopy={props.onSearchQueryCopy}
            />
            <Grouping
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
              props.resizeMode === ResizeModeEnum.MaxHeight ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Metrics__loader'
              height='100%'
              loaderComponent={<ChartLoader controlsCount={9} />}
            >
              {!!props.scatterPlotData?.[0]?.length ? (
                <ChartPanel
                  key={props.scatterPlotData?.length}
                  ref={props.chartPanelRef}
                  panelResizing={props.panelResizing}
                  chartType={ChartTypeEnum.ScatterPlot}
                  data={props.scatterPlotData}
                  focusedState={props.focusedState}
                  tooltip={props.tooltip}
                  zoom={props.zoom}
                  onActivePointChange={props.onActivePointChange}
                  chartProps={chartProps}
                  resizeMode={props.resizeMode}
                  controls={
                    <Controls
                      selectOptions={props.groupingSelectOptions}
                      tooltip={props.tooltip}
                      ignoreOutliers={props.ignoreOutliers}
                      zoom={props.zoom}
                      highlightMode={props.highlightMode}
                      axesScaleType={props.axesScaleType}
                      onChangeTooltip={props.onChangeTooltip}
                      onIgnoreOutliersChange={props.onIgnoreOutliersChange}
                      onZoomChange={props.onZoomChange}
                      onHighlightModeChange={props.onHighlightModeChange}
                      onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                      projectsDataMetrics={props.projectsDataMetrics}
                    />
                  }
                />
              ) : (
                !props.requestIsPending && (
                  <EmptyComponent
                    size='big'
                    content="It's super easy to search Aim experiments. Lookup search docs to learn more."
                  />
                )
              )}
            </BusyLoaderWrapper>
          </div>
          <ResizePanel
            className={`Metrics__ResizePanel${
              props.requestIsPending || props.scatterPlotData?.[0]?.length
                ? ''
                : '__hide'
            }`}
            panelResizing={props.panelResizing}
            resizeElemRef={props.resizeElemRef}
            resizeMode={props.resizeMode}
            onTableResizeModeChange={props.onTableResizeModeChange}
          />
          <div
            ref={props.tableElemRef}
            className={`Metrics__table__container${
              props.resizeMode === ResizeModeEnum.Hide ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Metrics__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!isEmpty(props.tableData) ? (
                <Table
                  // deletable
                  custom
                  ref={props.tableRef}
                  data={props.tableData}
                  columns={props.tableColumns}
                  // Table options
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
                  // Table actions
                  onSort={props.onSortChange}
                  onSortReset={props.onSortReset}
                  onExport={props.onExportTableData}
                  onManageColumns={props.onColumnsOrderChange}
                  onColumnsVisibilityChange={props.onColumnsVisibilityChange}
                  onTableDiffShow={props.onTableDiffShow}
                  onRowHeightChange={props.onRowHeightChange}
                  onRowsChange={props.onMetricVisibilityChange}
                  onRowHover={props.onTableRowHover}
                  onRowClick={props.onTableRowClick}
                  onTableResizeModeChange={props.onTableResizeModeChange}
                  updateColumnsWidths={props.updateColumnsWidths}
                />
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
  );
}

export default React.memo(Correlations);
