import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';

import './frontStyle.scss';
import HeatMap from '../../components/HeatMap/HeatMap';

function Front(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <section className='Front__container'>
      <Grid container spacing={1}>
        <Grid item>
          <Box>
            <Typography>Statistics</Typography>
            <div className='Front__Statistics__card'>
              <Typography>Experiments</Typography>
              <Typography>Runs</Typography>
            </div>
            <div className='Front__Statistics__card'>
              <Typography>Experiments</Typography>
              <Typography>Runs</Typography>
            </div>
          </Box>
        </Grid>
        <Grid xs item>
          Activity
          {/*<HeatMap endDate={new Date()} />*/}
        </Grid>
      </Grid>
    </section>
  );
}
export default Front;
