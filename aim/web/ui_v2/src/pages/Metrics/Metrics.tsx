import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import LineChart from 'components/LineChart/LineChart';
import Table from 'components/Table/Table';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import useStyles from './metricsStyle';

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
            style={{
              flex: '0.5 1 0',
            }}
            item
          >
            <Grid container className={classes.fullHeight} spacing={1}>
              <Grid item xs>
                <Paper className={classes.paper}>
                  {props.lineChartData.length ? (
                    <LineChart
                      index={0}
                      key='uniqueKey'
                      data={props.lineChartData as any}
                      axesScaleType={{
                        x: props.axesScaleType.xAxis,
                        y: props.axesScaleType.yAxis,
                      }}
                      curveInterpolation={props.curveInterpolation}
                      displayOutliers={props.displayOutliers}
                      zoomMode={props.zoomMode}
                    />
                  ) : null}
                </Paper>
              </Grid>
              <Grid item>
                <Paper className={classes.paper}>
                  <Controls
                    toggleDisplayOutliers={props.toggleDisplayOutliers}
                    displayOutliers={props.displayOutliers}
                    zoomMode={props.zoomMode}
                    toggleZoomMode={props.toggleZoomMode}
                    onSmoothingChange={props.onSmoothingChange}
                    onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                    axesScaleType={props.axesScaleType}
                  />
                </Paper>
              </Grid>
            </Grid>
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
          <Grid style={{ flex: '0.5 1 0' }} item xs ref={props.tableElemRef}>
            <Paper className={classes.paper}>
              {props.tableData.length ? (
                <Table
                  ref={props.tableRef}
                  onSort={() => null}
                  onExport={() => null}
                  data={props.tableData[0]}
                  columns={props.tableColumns}
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
