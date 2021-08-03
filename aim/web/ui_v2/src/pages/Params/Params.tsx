import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import useStyles from './paramsStyle';
import { IParamsProps } from 'types/pages/params/Params';

import HighPlot from 'components/HighPlot/HighPlot';
import Controls from './Controls/Controls';

const Params = ({
  curveInterpolation,
  curveInterpolationChangeHandler,
  chartElemRef,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  const classes = useStyles();

  return (
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
        <Grid
          ref={chartElemRef}
          style={{
            flex: '0.5 1 0',
          }}
          item
        >
          <Grid container className={classes.fullHeight} spacing={1}>
            <Grid item xs>
              <Paper className={classes.paper}>
                <HighPlot index={0} curveInterpolation={curveInterpolation} />
              </Paper>
            </Grid>
            <Grid item>
              <Paper className={classes.paper}>
                <Controls
                  curveInterpolationChangeHandler={
                    curveInterpolationChangeHandler
                  }
                  curveInterpolation={curveInterpolation}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Params);
