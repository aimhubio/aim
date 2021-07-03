import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

function AxisScale(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Select Axes Scale:</Box>
      <Divider />
      <MenuList>
        <MenuItem>X-axis scale</MenuItem>
        <MenuItem>Y-axis scale</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(AxisScale);
