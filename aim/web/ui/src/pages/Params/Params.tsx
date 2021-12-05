import React from 'react';
import { isEmpty } from 'lodash-es';

import ChartPanel from 'components/ChartPanel/ChartPanel';
// TODO [GA]: MetricsBar is imported as AppBar.
// Implement ParamsBar or use unified NavBar for explorers.
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import TableLoader from 'components/TableLoader/TableLoader';
import Table from 'components/Table/Table';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizePanel from 'components/ResizePanel/ResizePanel';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import GroupingPopovers from 'config/grouping/GroupingPopovers';

import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import Grouping from 'pages/components/Grouping/Grouping';

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
  requestIsPending,
  tooltip,
  hiddenMetrics,
  chartTitleData,
  panelResizing,
  tableColumns,
  tableRef,
  tableData,
  columnsWidths,
  tableRowHeight,
  onTableRowHover,
  onTableRowClick,
  onColumnsOrderChange,
  onRowHeightChange,
  onParamVisibilityChange,
  onSortFieldsChange,
  sortFields,
  resizeMode,
  notifyData,
  hiddenColumns,
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
  updateColumnsWidths,
  liveUpdateConfig,
  onLiveUpdateConfigChange,
  onShuffleChange,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  const chartProps: any[] = React.useMemo(() => {
    return (highPlotData || []).map((chartData: any, index: number) => ({
      curveInterpolation,
      isVisibleColorIndicator,
      chartTitle: chartTitleData[index],
    }));
  }, [
    highPlotData,
    curveInterpolation,
    isVisibleColorIndicator,
    chartTitleData,
  ]);

  return (
    <div ref={wrapperElemRef} className='Params__container'>
      <section className='Params__section'>
        <div className='Params__fullHeight Params__section__div'>
          <div>
            <AppBar
              onBookmarkCreate={onBookmarkCreate}
              onBookmarkUpdate={onBookmarkUpdate}
              onResetConfigData={onResetConfigData}
              liveUpdateConfig={liveUpdateConfig}
              onLiveUpdateConfigChange={onLiveUpdateConfigChange}
              title={'Params explorer'}
            />
          </div>
          <div className='Params__SelectForm__Grouping__container'>
            <SelectForm
              requestIsPending={requestIsPending}
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
              resizeMode === ResizeModeEnum.MaxHeight ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              height='100%'
              isLoading={requestIsPending}
              loaderComponent={<ChartLoader />}
            >
              {!!highPlotData?.[0]?.data?.length ? (
                <ChartPanel
                  ref={chartPanelRef}
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
                !requestIsPending && (
                  <EmptyComponent
                    size='big'
                    content="It's super easy to search Aim experiments. Lookup search docs to learn more."
                  />
                )
              )}
            </BusyLoaderWrapper>
          </div>
          <ResizePanel
            className={`Params__ResizePanel${
              requestIsPending || highPlotData?.[0]?.data?.length
                ? ''
                : '__hide'
            }`}
            panelResizing={panelResizing}
            resizeElemRef={resizeElemRef}
            resizeMode={resizeMode}
            onTableResizeModeChange={onTableResizeModeChange}
          />

          <div
            ref={tableElemRef}
            className={`Params__table__container${
              resizeMode === ResizeModeEnum.Hide ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={requestIsPending}
              className='Params__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!isEmpty(tableData) ? (
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
                  resizeMode={resizeMode}
                  columnsWidths={columnsWidths}
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
                />
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
