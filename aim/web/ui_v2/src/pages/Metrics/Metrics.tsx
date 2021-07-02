import React from 'react';
import { Box, Grid, Paper, RootRef } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import LineChart from '../../components/LineChart/LineChart';
import Table from 'components/Table/Table';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import useStyles from './metricsStyle';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <RootRef rootRef={props.wrapperRef}>
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
            ref={props.chartRef}
            style={{
              flex: '0.5 1 0',
            }}
            item
          >
            <Grid container className={classes.fullHeight} spacing={1}>
              <Grid item xs>
                <Paper className={classes.paper}>
                  <LineChart
                    key='uniqueKey'
                    data={[
                      {
                        key: 'uniqueKey1',
                        data: {
                          xValues: [0, 10, 20, 30, 40, 50, 60],
                          yValues: [15, 330, 200, 75, 75, 300, 500],
                        },
                        color: '#a10505',
                        dasharray: '2,4',
                        selector: '',
                      },
                      {
                        key: 'uniqueKey2',
                        data: {
                          xValues: [0, 10, 20, 30, 40, 50, 60],
                          yValues: [20, 33, 40, 79, 75, 30, 140],
                        },
                        color: '#0543a1',
                        dasharray: '0',
                        selector: '',
                      },
                      {
                        key: 'uniqueKey3',
                        data: {
                          xValues: [0, 10, 20, 30, 40, 50, 60],
                          yValues: [40, 68, 40, 120, 230, 99, 10],
                        },
                        color: '#165201',
                        dasharray: '3,13,10',
                        selector: '',
                      },
                    ]}
                  />
                </Paper>
              </Grid>
              <Grid item>
                <Paper className={classes.paper}>
                  <Controls />
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
          <Grid style={{ flex: '0.5 1 0' }} item xs ref={props.tableRef}>
            <Paper className={classes.paper}>
              <Table onSort={() => null} onExport={() => null} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </RootRef>
  );
}

export default React.memo(Metrics);
