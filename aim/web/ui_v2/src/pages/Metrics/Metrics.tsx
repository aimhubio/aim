import React from 'react';
import { Box, Grid, Paper, RootRef } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
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
          <Grid style={{ flex: '0.5 1 0' }} item ref={props.chartRef}>
            <Grid container className={classes.fullHeight} spacing={1}>
              <Grid item xs>
                <Paper className={classes.paper}>
                  <div>Chart</div>
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
            style={{ cursor: 'pointer' }}
            height='6px'
            onMouseDown={props.handleResize}
          >
            <MoreHorizIcon />
          </Box>
          <Grid style={{ flex: '0.5 1 0' }} item xs ref={props.tableRef}>
            <Paper className={classes.paper}>Table</Paper>
          </Grid>
        </Grid>
      </Box>
    </RootRef>
  );
}

export default React.memo(Metrics);
