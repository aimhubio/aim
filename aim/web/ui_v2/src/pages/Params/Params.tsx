import React from 'react';

import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import TableLoader from 'components/TableLoader/TableLoader';
import { isEmpty, size } from 'lodash-es';
import Table from 'components/Table/Table';
import Icon from 'components/Icon/Icon';

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
  isParamsLoading,
  tooltip,
  chartTitleData,
  panelResizing,
  tableColumns,
  tableRef,
  tableData,
  tableRowHeight,
  onTableRowHover,
  onTableRowClick,
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
            />
          </div>
          <div className='Params__SelectForm__Grouping__container'>
            <SelectForm
              selectedParamsData={selectedParamsData}
              onParamsSelectChange={onParamsSelectChange}
              onSelectRunQueryChange={onSelectRunQueryChange}
            />
            <Grouping
              groupingData={groupingData}
              groupingSelectOptions={groupingSelectOptions}
              onGroupingSelectChange={onGroupingSelectChange}
              onGroupingModeChange={onGroupingModeChange}
              onGroupingPaletteChange={onGroupingPaletteChange}
              onGroupingReset={onGroupingReset}
              onGroupingApplyChange={onGroupingApplyChange}
              onGroupingPersistenceChange={onGroupingPersistenceChange}
            />
          </div>
          <div ref={chartElemRef} className='Params__chart__container'>
            <BusyLoaderWrapper
              isLoading={isParamsLoading}
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
                  chartProps={chartProps}
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
                !isParamsLoading && (
                  <EmptyComponent
                    size='big'
                    content="It's super easy to search Aim experiments. Lookup search docs to learn more."
                  />
                )
              )}
            </BusyLoaderWrapper>
          </div>
          <div
            className={`Params__resize ${panelResizing ? 'resizing' : ''}`}
            ref={resizeElemRef}
          >
            <Icon name='more-horizontal' />
          </div>
          <div ref={tableElemRef} className='Params__table__container'>
            <BusyLoaderWrapper
              isLoading={isParamsLoading}
              className='Params__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!isEmpty(tableData) ? (
                <Table
                  custom
                  key={`${tableColumns?.length}-${size(tableData)}`}
                  ref={tableRef}
                  data={tableData}
                  columns={tableColumns}
                  // Table options
                  topHeader
                  groups={!Array.isArray(tableData)}
                  rowHeight={tableRowHeight}
                  sortOptions={groupingSelectOptions}
                  // Table actions
                  onSort={() => null}
                  onExport={onExportTableData}
                  onManageColumns={() => null}
                  onRowHeightChange={() => null}
                  onRowsChange={() => null}
                  onRowHover={onTableRowHover}
                  onRowClick={onTableRowClick}
                />
              ) : null}
            </BusyLoaderWrapper>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(Params);
