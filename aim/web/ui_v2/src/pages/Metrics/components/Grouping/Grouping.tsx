import React from 'react';
import { Button, Grid } from '@material-ui/core';

function Grouping(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Grid
      container
      spacing={1}
      justify='center'
      alignItems='center'
      wrap='nowrap'
    >
      Group By:
      <Grid item>
        <Button color='primary' variant='outlined' size='small'>
          Color
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' variant='outlined' size='small'>
          Style
        </Button>
      </Grid>
      <Grid item>
        <Button color='primary' variant='outlined' size='small'>
          Chart
        </Button>
      </Grid>
    </Grid>
  );
}

export default React.memo(Grouping);
