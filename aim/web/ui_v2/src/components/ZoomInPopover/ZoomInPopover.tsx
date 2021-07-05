import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

function ZoomInPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Select Zoom Mode</Box>
      <Divider />
      <MenuList>
        <MenuItem>Single Zooming</MenuItem>
        <MenuItem>Multiple Zooming</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(ZoomInPopover);
