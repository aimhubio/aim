import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

function ZoomOutPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Select Option To Zoom Out</Box>
      <Divider />
      <MenuList>
        <MenuItem>Zoom Out Chart</MenuItem>
        <MenuItem>Reset Zooming</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(ZoomOutPopover);
