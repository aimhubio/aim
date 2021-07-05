import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

function HighlightModesPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Highlight Modes</Box>
      <Divider />
      <MenuList>
        <MenuItem>Highlight Off</MenuItem>
        <MenuItem>Highlight Metric on Hover</MenuItem>
        <MenuItem>Highlight Run On Hover</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(HighlightModesPopover);
