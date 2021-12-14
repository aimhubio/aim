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
import GroupingPopovers from 'config/grouping/GroupingPopovers';

import Grouping from 'pages/components/Grouping/Grouping';
import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import Controls from 'pages/Scatters/components/Controls/Controls';
import SelectForm from 'pages/Scatters/components/SelectForm/SelectForm';

import { IScattersProps } from 'types/pages/scatters/Scatters';

import { ChartTypeEnum } from 'utils/d3';

import './Scatters.scss';

function Scatters(
  props: IScattersProps,
): React.FunctionComponentElement<React.ReactNode> {
  const chartProps: any[] = React.useMemo(() => {
    return (props.scatterPlotData || []).map((data: any, index: number) => ({
      chartTitle: props.chartTitleData[index],
    }));
  }, [props.scatterPlotData, props.chartTitleData]);

  return (
    <div ref={props.wrapperElemRef} className='Scatters__container'>
      <section className='Scatters__section'>
        <div className='Scatters__section__div Scatters__fullHeight'>
          <AppBar
            onBookmarkCreate={props.onBookmarkCreate}
            onBookmarkUpdate={props.onBookmarkUpdate}
            onResetConfigData={props.onResetConfigData}
            liveUpdateConfig={props.liveUpdateConfig}
            onLiveUpdateConfigChange={props.onLiveUpdateConfigChange}
            title='Scatters explorer'
          />
          <div className='Scatters__SelectForm__Grouping__container'>
            <SelectForm
              requestIsPending={props.requestIsPending}
              selectedOptionsData={props.selectedOptionsData}
              onSelectOptionsChange={props.onSelectOptionsChange}
              onSelectRunQueryChange={props.onSelectRunQueryChange}
            />
            <Grouping
              groupingPopovers={GroupingPopovers.filter(
                (p) => p.groupName === 'color' || p.groupName === 'chart',
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
            className={`Scatters__chart__container${
              props.resizeMode === ResizeModeEnum.MaxHeight ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Scatters__loader'
              height='100%'
              loaderComponent={<ChartLoader controlsCount={9} />}
            >
              {!!props.scatterPlotData?.[0]?.data?.length ? (
                <ChartPanel
                  key={props.scatterPlotData?.[0]?.data?.length}
                  ref={props.chartPanelRef}
                  panelResizing={props.panelResizing}
                  chartType={ChartTypeEnum.ScatterPlot}
                  data={props.scatterPlotData}
                  focusedState={props.focusedState}
                  tooltip={props.tooltip}
                  onActivePointChange={props.onActivePointChange}
                  chartProps={chartProps}
                  resizeMode={props.resizeMode}
                  controls={
                    <Controls
                      selectOptions={props.groupingSelectOptions}
                      tooltip={props.tooltip}
                      onChangeTooltip={props.onChangeTooltip}
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
            className={`Scatters__ResizePanel${
              props.requestIsPending || props.scatterPlotData?.[0]?.data?.length
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
            className={`Scatters__table__container${
              props.resizeMode === ResizeModeEnum.Hide ? '__hide' : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Scatters__loader'
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
                  onRowsChange={props.onParamVisibilityChange}
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

export default React.memo(Scatters);
