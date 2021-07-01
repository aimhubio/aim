import { Box, Grid, MenuItem, MenuList } from '@material-ui/core';
import React from 'react';

function Aggregation(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box borderBottom={1} p={0.5} bgcolor='indigo.100' borderColor='grey.400'>
        Select Aggregation Method
      </Box>
      <Box p={0.5}>Select Line:</Box>
      <MenuList>
        <MenuItem>Mean</MenuItem>
        <MenuItem>Median</MenuItem>
        <MenuItem>Min</MenuItem>
        <MenuItem>Max</MenuItem>
      </MenuList>
      <Box p={0.5}>Select Area:</Box>
      <MenuList>
        <MenuItem>None</MenuItem>
        <MenuItem>Min/Max</MenuItem>
        <MenuItem>Mean + Standard Deviation</MenuItem>
        <MenuItem>Mean + Standard Error</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(Aggregation);
