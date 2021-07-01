import { Button, Grid, Popover, Typography } from '@material-ui/core';
import Aggregation from 'components/Aggregation/Aggregation';

import React from 'react';

function Controls(): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
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
        <Button
          size='small'
          aria-describedby={id}
          variant='outlined'
          color='primary'
          onClick={handleClick}
        >
          Agg
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Typography>
            <Aggregation />
          </Typography>
        </Popover>
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
