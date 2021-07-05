import React from 'react';
import { Box, MenuList, MenuItem, Select, Divider } from '@material-ui/core';

function AlignXAxisPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Select Axes Alignment</Box>
      <Divider />
      <MenuList>
        <MenuItem>Step</MenuItem>
        <MenuItem>Epoch</MenuItem>
        <MenuItem>Relative Time</MenuItem>
        <MenuItem>Absolute Time</MenuItem>
        <MenuItem>
          Metric: <Select />
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(AlignXAxisPopover);
