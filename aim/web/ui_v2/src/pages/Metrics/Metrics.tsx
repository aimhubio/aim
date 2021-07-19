import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import Table from 'components/Table/Table';
import { IMetricProps } from 'types/pages/metrics/Metrics';
import { ChartTypeEnum, ScaleEnum } from 'utils/d3';
import ChartPanel from 'components/ChartPanel/ChartPanel';

import useStyles from './metricsStyle';
import { table } from 'console';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <div ref={props.wrapperElemRef}>
      <Box
        bgcolor='grey.200'
        component='section'
        height='100vh'
        overflow='hidden'
        className={classes.section}
      >
        <Grid
          container
          direction='column'
          justify='center'
          className={classes.fullHeight}
          spacing={1}
        >
          <Grid item>
            <Paper className={classes.paper}>
              <AppBar />
            </Paper>
          </Grid>
          <Grid item>
            <Grid container alignItems='stretch' spacing={1}>
              <Grid xs item>
                <Paper className={classes.paper}>
                  <SelectForm />
                </Paper>
              </Grid>
              <Grid item>
                <Paper className={classes.paper}>
                  <Box height='100%' display='flex'>
                    <Grouping />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            ref={props.chartElemRef}
            className={classes.chartContainer}
            item
          >
            {!!props.lineChartData[0]?.length && (
              <ChartPanel
                ref={props.chartPanelRef}
                chartType={ChartTypeEnum.LineChart}
                data={props.lineChartData as any}
                chartProps={[
                  {
                    axisScaleType: {
                      x: ScaleEnum.Linear,
                      y: ScaleEnum.Linear,
                    },
                    curveInterpolation: props.curveInterpolation,
                    displayOutliers: props.displayOutliers,
                    zoomMode: props.zoomMode,
                    highlightMode: props.highlightMode,
                  },
                ]}
                controls={
                  <Controls
                    toggleDisplayOutliers={props.toggleDisplayOutliers}
                    displayOutliers={props.displayOutliers}
                    zoomMode={props.zoomMode}
                    toggleZoomMode={props.toggleZoomMode}
                    highlightMode={props.highlightMode}
                    onChangeHighlightMode={props.onChangeHighlightMode}
                    onSmoothingChange={props.onSmoothingChange}
                  />
                }
                onActivePointChange={props.onActivePointChange}
              />
            )}
          </Grid>
          <div ref={props.resizeElemRef}>
            <Box
              justifyContent='center'
              display='flex'
              alignItems='center'
              className={classes.resize}
              height='6px'
            >
              <MoreHorizIcon />
            </Box>
          </div>
          <Grid
            item
            xs
            ref={props.tableElemRef}
            className={classes.tableContainer}
          >
            <Paper className={classes.paper}>
              {props.tableData.length ? (
                <Table
                  ref={props.tableRef}
                  onSort={() => null}
                  onExport={() => null}
                  data={[...props.tableData[0], ...props.tableData[1]]}
                  columns={props.tableColumns}
                  onRowHover={props.onTableRowHover}
                />
              ) : null}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default React.memo(Metrics);
