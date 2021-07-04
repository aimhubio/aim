import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

function AggregationPopup(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Select Aggregation Method</Box>
      <Divider />
      <Box p={0.5}>Select Line:</Box>
      <MenuList>
        <MenuItem>Mean</MenuItem>
        <MenuItem>Median</MenuItem>
        <MenuItem>Min</MenuItem>
        <MenuItem>Max</MenuItem>
      </MenuList>
      <Divider />
      <Box p={0.5}>Select Area:</Box>
      <MenuList>
        <MenuItem>None</MenuItem>
        <MenuItem>Min/Max</MenuItem>
        <MenuItem>Mean + Standard Deviation</MenuItem>
        <MenuItem>Mean + Standard Error</MenuItem>
        <MenuItem>Confidence Interval (95%)</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(AggregationPopup);
