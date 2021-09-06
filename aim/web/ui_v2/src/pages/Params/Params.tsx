import React from 'react';
import { Grid } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';

import './Params.scss';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import TableLoader from 'components/TableLoader/TableLoader';
import { size } from 'lodash-es';
import Table from 'components/CustomTable/Table';

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
  tooltip,
  chartTitleData,
  requestIsPending,
  panelResizing,
  tableColumns,
  tableRef,
  tableData,
  tableRowHeight,
  onTableRowHover,
  onTableRowClick,
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
  return (
    <div ref={wrapperElemRef} className='Params__container'>
      <section className='Params__section'>
        <Grid
          container
          direction='column'
          justifyContent='center'
          className='Params__fullHeight'
        >
          <Grid item>
            <AppBar
              onBookmarkCreate={onBookmarkCreate}
              onBookmarkUpdate={onBookmarkUpdate}
              onResetConfigData={onResetConfigData}
            />
          </Grid>
          <Grid item>
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
          </Grid>
          <Grid ref={chartElemRef} className='Params__chart__container' item>
            <BusyLoaderWrapper
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
                  chartTitleData={chartTitleData}
                  panelResizing={panelResizing}
                  chartProps={[
                    {
                      curveInterpolation,
                      isVisibleColorIndicator,
                    },
                  ]}
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
                  <EmptyComponent size='big' content={'Choose Params'} />
                )
              )}
            </BusyLoaderWrapper>
          </Grid>
          <div ref={resizeElemRef}>
            <div className='Params__resize'>
              <MoreHorizIcon />
            </div>
          </div>
          <Grid item xs ref={tableElemRef} className='Params__table__container'>
            {/* <BusyLoaderWrapper
              isLoading={false}
              loaderComponent={<TableLoader />}
            >
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
                onExport={() => null}
                onManageColumns={() => null}
                onRowHeightChange={() => null}
                onRowsChange={() => null}
                onRowHover={onTableRowHover}
                onRowClick={onTableRowClick}
              />
            </BusyLoaderWrapper> */}
          </Grid>
        </Grid>
      </section>
    </div>
  );
};

export default React.memo(Params);
