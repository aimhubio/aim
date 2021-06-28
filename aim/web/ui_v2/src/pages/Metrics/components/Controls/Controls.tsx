import { Button, Grid } from '@material-ui/core';
import React from 'react';

function Controls(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Grid
      container
      direction='column'
      justify='center'
      spacing={1}
      alignItems='center'
    >
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Outliers
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Interp
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Agg
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Num s.
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Smooth
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          Zoom
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' size='small' variant='outlined'>
          export
        </Button>
      </Grid>
    </Grid>
  );
}

export default Controls;
