import React from 'react';
import { Box, Grid, makeStyles, Paper } from '@material-ui/core';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import Table from 'components/Table/Table';

const useStyles = makeStyles(({ spacing }) => ({
  paper: {
    padding: spacing(1),
    height: '100%',
  },
  section: {
    margin: spacing(0.5),
  },
}));

function Metrics(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <Box component='section' className={classes.section}>
      <Grid
        container
        direction='column'
        justify='center'
        alignItems='stretch'
        spacing={1}
      >
        <Grid item xs spacing={1}>
          <Paper square className={classes.paper}>
            <AppBar />
          </Paper>
        </Grid>
        <Grid item xs>
          <Grid container alignItems='stretch' spacing={1}>
            <Grid xs item>
              <Paper className={classes.paper} square>
                <SelectForm />
              </Paper>
            </Grid>
            <Grid item>
              <Paper className={classes.paper} square>
                <Box height='100%' display='flex'>
                  <Grouping />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs>
              <Paper square className={classes.paper}>
                <div>Chart</div>
              </Paper>
            </Grid>
            <Grid item>
              <Paper square className={classes.paper}>
                <Controls />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper square className={classes.paper}>
            <Table onSort={() => null} onExport={() => null} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Metrics;
