import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';

import ITableProps from 'types/components/Table/Table';

function Table(
  props: ITableProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box border={1} borderColor='grey.400' borderRadius={2}>
      <Box component='nav' p={0.5}>
        <Grid container justify='space-between' alignItems='center'>
          <Grid xs item>
            <Grid container spacing={1}>
              {props.onManageColumns && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onManageColumns}
                  >
                    Manage Columns
                  </Button>
                </Grid>
              )}
              {props.onRowsChange && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onRowsChange}
                  >
                    Hide Rows
                  </Button>
                </Grid>
              )}
              {props.onSort && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onSort}
                  >
                    Sort
                  </Button>
                </Grid>
              )}
              {props.onRowHeightChange && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onRowHeightChange}
                  >
                    Row Height
                  </Button>
                </Grid>
              )}
              <Grid item xs />
              {props.onExport && (
                <Grid item xs={1}>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                  >
                    Export
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Box p={0.5} borderTop={1} borderColor='grey.400'>
          Table Header
        </Box>
        <Box p={0.5} borderTop={1} borderColor='grey.400'>
          Table Body
        </Box>
      </Box>
    </Box>
  );
}

export default React.memo(Table);
