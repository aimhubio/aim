import React from 'react';
import { Box, Grid, makeStyles, Paper } from '@material-ui/core';
import BreadCrumbs from 'components/BreadCrumbs/BreadCrumbs';
import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';

const useStyles = makeStyles(({ spacing }) => ({
  paper: {
    padding: spacing(1),
    margin: spacing(0.5),
  },
}));

function Metrics(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();
  return (
    <Box component='section'>
      <Grid container direction='column' justify='center'>
        <Grid item>
          <BreadCrumbs />
        </Grid>
        <Grid xs={12} item>
          <Grid container>
            <Grid xs={10} item>
              <Paper className={classes.paper} square>
                <SelectForm />
              </Paper>
            </Grid>
            <Grid item xs={2}>
              <Paper square className={classes.paper}>
                <Grouping />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={12} item>
          <Grid container>
            <Grid item xs={11}>
              <Paper square className={classes.paper}>
                <div>Chart</div>
              </Paper>
            </Grid>
            <Grid xs={1}>
              <Paper square className={classes.paper}>
                <Controls />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={12} item>
          <Paper square className={classes.paper}>
            Table
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Metrics;
