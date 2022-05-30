import React from 'react';
import _ from 'lodash-es';

import ChartPanel from 'components/ChartPanel/ChartPanel';
// TODO [GA]: MetricsBar is imported as AppBar.
// Implement ParamsBar or use unified NavBar for explorers.
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import TableLoader from 'components/TableLoader/TableLoader';
import Table from 'components/Table/Table';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import Grouping from 'components/Grouping/Grouping';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import GroupingPopovers from 'config/grouping/GroupingPopovers';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import {
  IllustrationsEnum,
  Request_Illustrations,
} from 'config/illustrationConfig/illustrationConfig';

import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';

import { AppNameEnum } from 'services/models/explorer';

import { IParamsProps } from 'types/pages/params/Params';

import { ChartTypeEnum } from 'utils/d3';

import SelectForm from './components/SelectForm/SelectForm';
import Controls from './components/Controls/Controls';

import './Params.scss';

const Params = ({
  curveInterpolation,
  highPlotData,
  chartPanelRef,
  chartElemRef,
  focusedState,
  isVisibleColorIndicator,
  selectedParamsData,
  wrapperElemRef,
  resizeElemRef,
  tableElemRef,
  groupingData,
  groupingSelectOptions,
  requestStatus,
  tooltip,
  hiddenMetrics,
  chartTitleData,
  panelResizing,
  tableColumns,
  tableRef,
  tableData,
  columnsWidths,
  tableRowHeight,
  onColumnsOrderChange,
  onRowHeightChange,
  onParamVisibilityChange,
  onSortFieldsChange,
  sortFields,
  resizeMode,
  notifyData,
  hiddenColumns,
  liveUpdateConfig,
  selectFormData,
  onTableRowHover,
  onTableRowClick,
  hideSystemMetrics,
  onExportTableData,
  onCurveInterpolationChange,
  onActivePointChange,
  onColorIndicatorChange,
  onParamsSelectChange,
  onSelectRunQueryChange,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  onChangeTooltip,
  onTableResizeModeChange,
  onNotificationDelete,
  onColumnsVisibilityChange,
  onTableDiffShow,
  onSortReset,
  onAxisBrushExtentChange,
  updateColumnsWidths,
  onLiveUpdateConfigChange,
  onShuffleChange,
  onRowSelect,
  archiveRuns,
  deleteRuns,
  selectedRows,
  columnsOrder,
  brushExtents,
  chartPanelOffsetHeight,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  const chartProps: any[] = React.useMemo(() => {
    return (highPlotData || []).map((chartData: any, index: number) => ({
      curveInterpolation,
      isVisibleColorIndicator,
      onAxisBrushExtentChange,
      brushExtents,
      chartTitle: chartTitleData[index],
    }));
  }, [
    highPlotData,
    curveInterpolation,
    isVisibleColorIndicator,
    chartTitleData,
    onAxisBrushExtentChange,
    brushExtents,
  ]);

  return (
    <div ref={wrapperElemRef} className='Params__container'>
      <section className='Params__section'>
        <div className='Params__fullHeight Params__section__div'>
          <div>
            <AppBar
              explorerName='PARAMS'
              onBookmarkCreate={onBookmarkCreate}
              onBookmarkUpdate={onBookmarkUpdate}
              onResetConfigData={onResetConfigData}
              liveUpdateConfig={liveUpdateConfig}
              onLiveUpdateConfigChange={onLiveUpdateConfigChange}
              title={pageTitlesEnum.PARAMS_EXPLORER}
            />
          </div>
          <div className='Params__SelectForm__Grouping__container'>
            <SelectForm
              selectFormData={selectFormData}
              requestIsPending={requestStatus === RequestStatusEnum.Pending}
              selectedParamsData={selectedParamsData}
              onParamsSelectChange={onParamsSelectChange}
              onSelectRunQueryChange={onSelectRunQueryChange}
            />
            <Grouping
              groupingPopovers={GroupingPopovers.filter(
                (p) =>
                  p.groupName === 'color' ||
                  p.groupName === 'stroke' ||
                  p.groupName === 'chart',
              )}
              groupingData={groupingData}
              groupingSelectOptions={groupingSelectOptions}
              onGroupingSelectChange={onGroupingSelectChange}
              onGroupingModeChange={onGroupingModeChange}
              onGroupingPaletteChange={onGroupingPaletteChange}
              onGroupingReset={onGroupingReset}
              onGroupingApplyChange={onGroupingApplyChange}
              onGroupingPersistenceChange={onGroupingPersistenceChange}
              onShuffleChange={onShuffleChange}
            />
          </div>

          <div
            ref={chartElemRef}
            className={`Params__chart__container${
              resizeMode === ResizeModeEnum.MaxHeight
                ? '__hide'
                : requestStatus !== RequestStatusEnum.Pending &&
                  _.isEmpty(tableData)
                ? '__fullHeight'
                : ''
            }`}
          >
            <BusyLoaderWrapper
              height='100%'
              isLoading={requestStatus === RequestStatusEnum.Pending}
              loaderComponent={<ChartLoader />}
            >
              {!_.isEmpty(tableData) ? (
                <ChartPanel
                  ref={chartPanelRef}
                  chartPanelOffsetHeight={chartPanelOffsetHeight}
                  key={highPlotData?.[0]?.data?.length}
                  chartType={ChartTypeEnum.HighPlot}
                  data={highPlotData}
                  focusedState={focusedState}
                  onActivePointChange={onActivePointChange}
                  tooltip={tooltip}
                  panelResizing={panelResizing}
                  chartProps={chartProps}
                  resizeMode={resizeMode}
                  controls={
                    <Controls
                      curveInterpolation={curveInterpolation}
                      isVisibleColorIndicator={isVisibleColorIndicator}
                      selectOptions={groupingSelectOptions}
                      tooltip={tooltip}
                      onCurveInterpolationChange={onCurveInterpolationChange}
                      onColorIndicatorChange={onColorIndicatorChange}
                      onChangeTooltip={onChangeTooltip}
                    />
                  }
                />
              ) : (
                selectFormData.options !== undefined && (
                  <IllustrationBlock
                    size='xLarge'
                    page='params'
                    type={
                      selectFormData.options?.length
                        ? Request_Illustrations[requestStatus]
                        : IllustrationsEnum.EmptyData
                    }
                  />
                )
              )}
            </BusyLoaderWrapper>
          </div>
          <ResizePanel
            className={`Params__ResizePanel${
              _.isEmpty(tableData) &&
              requestStatus !== RequestStatusEnum.Pending
                ? '__hide'
                : ''
            }`}
            panelResizing={panelResizing}
            resizeElemRef={resizeElemRef}
            resizeMode={resizeMode}
            onTableResizeModeChange={onTableResizeModeChange}
          />
          <div
            ref={tableElemRef}
            className={`Params__table__container${
              requestStatus !== RequestStatusEnum.Pending &&
              (resizeMode === ResizeModeEnum.Hide || _.isEmpty(tableData))
                ? '__hide'
                : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={requestStatus === RequestStatusEnum.Pending}
              className='Params__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!_.isEmpty(tableData) ? (
                <ErrorBoundary>
                  <Table
                    custom
                    ref={tableRef}
                    data={tableData}
                    columns={tableColumns}
                    // Table options
                    topHeader
                    groups={!Array.isArray(tableData)}
                    rowHeight={tableRowHeight}
                    rowHeightMode={
                      tableRowHeight === RowHeightSize.sm
                        ? 'small'
                        : tableRowHeight === RowHeightSize.md
                        ? 'medium'
                        : 'large'
                    }
                    sortOptions={groupingSelectOptions}
                    sortFields={sortFields}
                    hiddenRows={hiddenMetrics}
                    hiddenColumns={hiddenColumns}
                    hideSystemMetrics={hideSystemMetrics}
                    resizeMode={resizeMode}
                    columnsWidths={columnsWidths}
                    selectedRows={selectedRows}
                    appName={AppNameEnum.PARAMS}
                    hiddenChartRows={highPlotData?.length === 0}
                    columnsOrder={columnsOrder}
                    // Table actions
                    onSortReset={onSortReset}
                    onSort={onSortFieldsChange}
                    onExport={onExportTableData}
                    onColumnsVisibilityChange={onColumnsVisibilityChange}
                    onManageColumns={onColumnsOrderChange}
                    onRowHeightChange={onRowHeightChange}
                    onRowsChange={onParamVisibilityChange}
                    onRowHover={onTableRowHover}
                    onRowClick={onTableRowClick}
                    onTableResizeModeChange={onTableResizeModeChange}
                    onTableDiffShow={onTableDiffShow}
                    updateColumnsWidths={updateColumnsWidths}
                    onRowSelect={onRowSelect}
                    archiveRuns={archiveRuns}
                    deleteRuns={deleteRuns}
                    focusedState={focusedState}
                    multiSelect
                  />
                </ErrorBoundary>
              ) : null}
            </BusyLoaderWrapper>
          </div>
        </div>
      </section>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </div>
  );
};

export default React.memo(Params);
