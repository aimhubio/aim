import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import useStyles from './paramsStyle';
import { IParamsProps } from 'types/pages/params/Params';

import HighPlot from 'components/HighPlot/HighPlot';

const Params = (
  props: IParamsProps,
): React.FunctionComponentElement<React.ReactNode> => {
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
          ref={props.chartElemRef}
          style={{
            flex: '0.5 1 0',
          }}
          item
        >
          <Grid container className={classes.fullHeight} spacing={1}>
            <Grid item xs>
              <Paper className={classes.paper}>
                <HighPlot index={0} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Params);
