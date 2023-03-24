import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import ChartPanel from 'components/ChartPanel/ChartPanel';
// TODO [GA]: MetricsBar is imported as AppBar.
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import Table from 'components/Table/Table';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import Grouping from 'components/Grouping/Grouping';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ProgressBar from 'components/ProgressBar/ProgressBar';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import {
  RowHeightSize,
  VisualizationElementEnum,
} from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import GroupingPopovers, {
  GroupNameEnum,
} from 'config/grouping/GroupingPopovers';
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
  sameValueColumns,
  brushExtents,
  chartPanelOffsetHeight,
  requestProgress,
  sortOptions,
  onRunsTagsChange,
  onRowsVisibilityChange,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  const [isProgressBarVisible, setIsProgressBarVisible] =
    React.useState<boolean>(false);
  const chartProps: any[] = React.useMemo(() => {
    return (highPlotData || []).map((chartData: any) => ({
      curveInterpolation,
      isVisibleColorIndicator,
      onAxisBrushExtentChange,
      brushExtents,
      chartTitle: chartTitleData[chartData.data[0]?.chartIndex],
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
        <div className='Params__fullHeight Params__section__appBarContainer'>
          <div>
            <AppBar
              disabled={isProgressBarVisible}
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
              isDisabled={isProgressBarVisible}
              selectedParamsData={selectedParamsData}
              onParamsSelectChange={onParamsSelectChange}
              onSelectRunQueryChange={onSelectRunQueryChange}
            />
            <Grouping
              groupingPopovers={GroupingPopovers.filter(
                (p) =>
                  p.groupName === GroupNameEnum.COLOR ||
                  p.groupName === GroupNameEnum.STROKE ||
                  p.groupName === GroupNameEnum.CHART,
              )}
              isDisabled={isProgressBarVisible}
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
          <div className='Params__visualization'>
            <ProgressBar
              progress={requestProgress}
              pendingStatus={requestStatus === RequestStatusEnum.Pending}
              processing={false}
              setIsProgressBarVisible={setIsProgressBarVisible}
            />
            {_.isEmpty(tableData) && _.isEmpty(highPlotData) ? (
              <IllustrationBlock
                size='xLarge'
                page='params'
                type={
                  selectFormData.options?.length
                    ? Request_Illustrations[requestStatus]
                    : IllustrationsEnum.EmptyData
                }
              />
            ) : (
              <>
                <div
                  ref={chartElemRef}
                  className={classNames('Params__chart__container', {
                    fullHeight: resizeMode === ResizeModeEnum.Hide,
                    hide: resizeMode === ResizeModeEnum.MaxHeight,
                  })}
                >
                  {resizeMode === ResizeModeEnum.MaxHeight ? null : (
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
                      selectOptions={groupingSelectOptions}
                      onRunsTagsChange={onRunsTagsChange}
                      onChangeTooltip={onChangeTooltip}
                      controls={
                        <Controls
                          curveInterpolation={curveInterpolation}
                          isVisibleColorIndicator={isVisibleColorIndicator}
                          selectOptions={groupingSelectOptions}
                          tooltip={tooltip}
                          onCurveInterpolationChange={
                            onCurveInterpolationChange
                          }
                          onColorIndicatorChange={onColorIndicatorChange}
                          onChangeTooltip={onChangeTooltip}
                        />
                      }
                    />
                  )}
                </div>
                <ResizePanel
                  className='Params__ResizePanel'
                  panelResizing={panelResizing}
                  resizeElemRef={resizeElemRef}
                  resizeMode={resizeMode}
                  onTableResizeModeChange={onTableResizeModeChange}
                />
                <div
                  ref={tableElemRef}
                  className={classNames('Params__table__container', {
                    fullHeight: resizeMode === ResizeModeEnum.MaxHeight,
                    hide: resizeMode === ResizeModeEnum.Hide,
                  })}
                >
                  {resizeMode === ResizeModeEnum.Hide ? null : (
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
                        sortOptions={sortOptions}
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
                        sameValueColumns={sameValueColumns!}
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
                        onRowsVisibilityChange={onRowsVisibilityChange}
                        onRowSelect={onRowSelect}
                        archiveRuns={archiveRuns}
                        deleteRuns={deleteRuns}
                        focusedState={focusedState}
                        visualizationElementType={VisualizationElementEnum.LINE}
                        multiSelect
                      />
                    </ErrorBoundary>
                  )}
                </div>
              </>
            )}
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
