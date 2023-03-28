import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import Grouping from 'components/Grouping/Grouping';
import ProgressBar from 'components/ProgressBar/ProgressBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import {
  RowHeightSize,
  VisualizationElementEnum,
} from 'config/table/tableConfigs';
import GroupingPopovers, {
  GroupNameEnum,
} from 'config/grouping/GroupingPopovers';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import {
  IllustrationsEnum,
  Request_Illustrations,
} from 'config/illustrationConfig/illustrationConfig';

import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import Controls from 'pages/Scatters/components/Controls/Controls';
import SelectForm from 'pages/Scatters/components/SelectForm/SelectForm';

import { AppNameEnum } from 'services/models/explorer';

import { IScattersProps } from 'types/pages/scatters/Scatters';

import { ChartTypeEnum } from 'utils/d3';

import './Scatters.scss';

function Scatters(
  props: IScattersProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [isProgressBarVisible, setIsProgressBarVisible] =
    React.useState<boolean>(false);
  const chartProps: any[] = React.useMemo(() => {
    return (props.scatterPlotData || []).map((chartData: any) => ({
      chartTitle: props.chartTitleData[chartData.data[0]?.chartIndex],
      trendlineOptions: props.trendlineOptions,
    }));
  }, [props.scatterPlotData, props.chartTitleData, props.trendlineOptions]);

  return (
    <ErrorBoundary>
      <div ref={props.wrapperElemRef} className='Scatters__container'>
        <section className='Scatters__section'>
          <div className='Scatters__section__appBarContainer Scatters__fullHeight'>
            <AppBar
              disabled={isProgressBarVisible}
              explorerName='SCATTERS'
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
              liveUpdateConfig={props.liveUpdateConfig}
              onLiveUpdateConfigChange={props.onLiveUpdateConfigChange}
              title='Scatters explorer'
            />
            <div className='Scatters__SelectForm__Grouping__container'>
              <SelectForm
                isDisabled={isProgressBarVisible}
                requestIsPending={
                  props.requestStatus === RequestStatusEnum.Pending
                }
                selectFormData={props.selectFormData}
                selectedOptionsData={props.selectedOptionsData}
                onSelectOptionsChange={props.onSelectOptionsChange}
                onSelectRunQueryChange={props.onSelectRunQueryChange}
              />
              <Grouping
                groupingPopovers={GroupingPopovers.filter(
                  (p) =>
                    p.groupName === GroupNameEnum.COLOR ||
                    p.groupName === GroupNameEnum.CHART,
                )}
                isDisabled={isProgressBarVisible}
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
            <div className='Scatters__visualization'>
              <ProgressBar
                progress={props.requestProgress}
                pendingStatus={
                  props.requestStatus === RequestStatusEnum.Pending
                }
                processing={false}
                setIsProgressBarVisible={setIsProgressBarVisible}
              />
              {_.isEmpty(props.tableData) &&
              _.isEmpty(props.scatterPlotData) ? (
                <IllustrationBlock
                  size='xLarge'
                  page='scatters'
                  type={
                    props.selectFormData.options?.length
                      ? Request_Illustrations[props.requestStatus]
                      : IllustrationsEnum.EmptyData
                  }
                />
              ) : (
                <>
                  <div
                    ref={props.chartElemRef}
                    className={classNames('Scatters__chart__container', {
                      fullHeight: props.resizeMode === ResizeModeEnum.Hide,
                      hide: props.resizeMode === ResizeModeEnum.MaxHeight,
                    })}
                  >
                    {props.resizeMode === ResizeModeEnum.MaxHeight ? null : (
                      <ChartPanel
                        key={props.scatterPlotData?.[0]?.data?.length}
                        ref={props.chartPanelRef}
                        chartPanelOffsetHeight={props.chartPanelOffsetHeight}
                        panelResizing={props.panelResizing}
                        chartType={ChartTypeEnum.ScatterPlot}
                        data={props.scatterPlotData}
                        focusedState={props.focusedState}
                        tooltip={props.tooltip}
                        onActivePointChange={props.onActivePointChange}
                        chartProps={chartProps}
                        resizeMode={props.resizeMode}
                        selectOptions={props.groupingSelectOptions}
                        onRunsTagsChange={props.onRunsTagsChange}
                        onChangeTooltip={props.onChangeTooltip}
                        controls={
                          <Controls
                            chartProps={chartProps}
                            chartType={ChartTypeEnum.ScatterPlot}
                            data={props.scatterPlotData}
                            selectOptions={props.groupingSelectOptions}
                            tooltip={props.tooltip}
                            onChangeTooltip={props.onChangeTooltip}
                            projectsDataMetrics={props.projectsDataMetrics}
                            trendlineOptions={props.trendlineOptions}
                            onChangeTrendlineOptions={
                              props.onChangeTrendlineOptions
                            }
                          />
                        }
                      />
                    )}
                  </div>
                  <ResizePanel
                    className='Scatters__ResizePanel'
                    panelResizing={props.panelResizing}
                    resizeElemRef={props.resizeElemRef}
                    resizeMode={props.resizeMode}
                    onTableResizeModeChange={props.onTableResizeModeChange}
                  />
                  <div
                    ref={props.tableElemRef}
                    className={classNames('Scatters__table__container', {
                      fullHeight: props.resizeMode === ResizeModeEnum.MaxHeight,
                      hide: props.resizeMode === ResizeModeEnum.Hide,
                    })}
                  >
                    {props.resizeMode === ResizeModeEnum.Hide ? null : (
                      <ErrorBoundary>
                        <Table
                          // deletable
                          custom
                          ref={props.tableRef}
                          data={props.tableData}
                          columns={props.tableColumns}
                          // Table options
                          topHeader
                          appName={AppNameEnum.SCATTERS}
                          groups={!Array.isArray(props.tableData)}
                          rowHeight={props.tableRowHeight}
                          rowHeightMode={
                            props.tableRowHeight === RowHeightSize.sm
                              ? 'small'
                              : props.tableRowHeight === RowHeightSize.md
                              ? 'medium'
                              : 'large'
                          }
                          sortOptions={props.sortOptions}
                          sortFields={props.sortFields}
                          hiddenRows={props.hiddenMetrics}
                          hiddenColumns={props.hiddenColumns}
                          hideSystemMetrics={props.hideSystemMetrics}
                          resizeMode={props.resizeMode}
                          columnsWidths={props.columnsWidths}
                          selectedRows={props.selectedRows}
                          hiddenChartRows={props.scatterPlotData?.length === 0}
                          columnsOrder={props.columnsOrder}
                          isLoading={
                            props.requestStatus === RequestStatusEnum.Pending
                          }
                          sameValueColumns={props?.sameValueColumns!}
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
                          onRowsChange={props.onParamVisibilityChange}
                          onRowHover={props.onTableRowHover}
                          onRowClick={props.onTableRowClick}
                          onTableResizeModeChange={
                            props.onTableResizeModeChange
                          }
                          updateColumnsWidths={props.updateColumnsWidths}
                          onRowSelect={props.onRowSelect}
                          archiveRuns={props.archiveRuns}
                          deleteRuns={props.deleteRuns}
                          focusedState={props.focusedState}
                          onRowsVisibilityChange={props.onRowsVisibilityChange}
                          visualizationElementType={
                            VisualizationElementEnum.POINT
                          }
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

export default React.memo(Scatters);
