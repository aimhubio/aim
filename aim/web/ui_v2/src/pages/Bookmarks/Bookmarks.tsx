import React from 'react';
import { Box, Paper } from '@material-ui/core';

function Bookmarks() {
  return (
    <Box
      bgcolor='grey.200'
      component='section'
      height='100vh'
      overflow='hidden'
    >
      <Paper>
        <Box p={1}>Bookmarks</Box>
      </Paper>
    </Box>
  );
}

export default Bookmarks;
