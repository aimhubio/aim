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
import { ScaleEnum } from 'utils/d3';
import { ILine } from 'types/components/LineChart/LineChart';

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
                  {props.metricsCollection?.[0] && (
                    <LineChart
                      key='uniqueKey'
                      data={props.lineChartData[0]}
                      axisScaleType={{
                        x: ScaleEnum.Linear,
                        y: ScaleEnum.Linear,
                      }}
                      displayOutliers={props.displayOutliers}
                    />
                  )}
                </Paper>
              </Grid>
              <Grid item>
                <Paper className={classes.paper}>
                  <Controls
                    toggleDisplayOutliers={props.toggleDisplayOutliers}
                    displayOutliers={props.displayOutliers}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Box
            justifyContent='center'
            display='flex'
            alignItems='center'
            className={classes.resize}
            height='6px'
            onMouseDown={props.handleResize}
          >
            <MoreHorizIcon />
          </Box>
          <Grid style={{ flex: '0.5 1 0' }} item xs ref={props.tableElemRef}>
            <Paper className={classes.paper}>
              {props.metricsCollection?.[0] && (
                <Table
                  ref={props.tableRef}
                  onSort={() => null}
                  onExport={() => null}
                  data={props.metricsCollection[0]}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default React.memo(Metrics);
