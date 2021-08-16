import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';

import { IMetricProps } from 'types/pages/metrics/Metrics';
import { ChartTypeEnum } from 'utils/d3';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import './Metrics.scss';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div ref={props.wrapperElemRef} className='Metrics__container'>
      <Box
        bgcolor='grey.200'
        component='section'
        height='100vh'
        overflow='hidden'
        className='Metrics'
      >
        <Grid
          container
          direction='column'
          justifyContent='center'
          className='Metrics__fullHeight'
          spacing={1}
        >
          <Grid item>
            <Paper className='Metrics__paper'>
              <AppBar
                onBookmarkCreate={props.onBookmarkCreate}
                onBookmarkUpdate={props.onBookmarkUpdate}
                onResetConfigData={props.onResetConfigData}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Grid container alignItems='stretch' spacing={1}>
              <Grid xs item>
                <Paper className='Metrics__paper'>
                  <SelectForm />
                </Paper>
              </Grid>
              <Grid item>
                <Paper className='Metrics__paper'>
                  <Box height='100%' display='flex'>
                    <Grouping
                      groupingData={props.groupingData}
                      onGroupingSelectChange={props.onGroupingSelectChange}
                      onGroupingModeChange={props.onGroupingModeChange}
                      onGroupingPaletteChange={props.onGroupingPaletteChange}
                      onGroupingReset={props.onGroupingReset}
                      onGroupingApplyChange={props.onGroupingApplyChange}
                      onGroupingPersistenceChange={
                        props.onGroupingPersistenceChange
                      }
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            ref={props.chartElemRef}
            className='Metrics__chart__container'
            item
          >
            {!!props.lineChartData?.[0]?.length ? (
              <ChartPanel
                ref={props.chartPanelRef}
                chartType={ChartTypeEnum.LineChart}
                data={props.lineChartData as any}
                focusedState={props.focusedState}
                onActivePointChange={props.onActivePointChange}
                tooltipContent={props.tooltipContent}
                chartProps={[
                  {
                    axesScaleType: props.axesScaleType,
                    curveInterpolation: props.curveInterpolation,
                    displayOutliers: props.displayOutliers,
                    zoomMode: props.zoomMode,
                    highlightMode: props.highlightMode,
                    aggregation: props.aggregation,
                  },
                ]}
                controls={
                  <Controls
                    smoothingAlgorithm={props.smoothingAlgorithm}
                    smoothingFactor={props.smoothingFactor}
                    curveInterpolation={props.curveInterpolation}
                    displayOutliers={props.displayOutliers}
                    zoomMode={props.zoomMode}
                    highlightMode={props.highlightMode}
                    aggregation={props.aggregation}
                    axesScaleType={props.axesScaleType}
                    onDisplayOutliersChange={props.onDisplayOutliersChange}
                    onZoomModeChange={props.onZoomModeChange}
                    onHighlightModeChange={props.onHighlightModeChange}
                    onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                    onSmoothingChange={props.onSmoothingChange}
                    onAggregationChange={props.onAggregationChange}
                  />
                }
              />
            ) : null}
          </Grid>
          <div ref={props.resizeElemRef}>
            <Box
              justifyContent='center'
              display='flex'
              alignItems='center'
              className='Metrics__resize'
              height='6px'
            >
              <MoreHorizIcon />
            </Box>
          </div>
          <Grid
            item
            xs
            ref={props.tableElemRef}
            className='Metrics__table__container'
          >
            <Paper className='Metrics__paper'>
              {props.tableData?.length > 0 ? (
                <Table
                  ref={props.tableRef}
                  onSort={() => null}
                  onExport={() => null}
                  data={props.tableData.flat()}
                  columns={props.tableColumns}
                  onRowHover={props.onTableRowHover}
                  onRowClick={props.onTableRowClick}
                />
              ) : null}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {props.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={props.onNotificationDelete}
          data={props.notifyData}
        />
      )}
    </div>
  );
}

export default React.memo(Metrics);
