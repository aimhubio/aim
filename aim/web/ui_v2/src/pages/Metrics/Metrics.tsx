import React from 'react';
import { Box, Grid, Paper } from '@material-ui/core';
import BreadCrumbs from 'components/BreadCrumbs/BreadCrumbs';
import SelectForm from './components/SelectForm/SelectForm';
import GroupBy from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';

function Metrics(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box component='section'>
      <Grid container direction='column' justify='center'>
        <Grid item>
          <BreadCrumbs />
        </Grid>
        <Grid item>
          <Paper square>
            <SelectForm />
            <GroupBy />
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <div>Chart</div>
            <Controls />
          </Paper>
        </Grid>
        <Grid item>
          <Paper>Table</Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Metrics;
