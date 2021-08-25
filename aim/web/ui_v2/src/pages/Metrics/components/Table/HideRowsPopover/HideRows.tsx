import { MenuItem, MenuList } from '@material-ui/core';
import React from 'react';

function HideRows(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <MenuList>
      <MenuItem>Visualize All Rows</MenuItem>
      <MenuItem>Hide All Rows</MenuItem>
    </MenuList>
  );
}

export default React.memo(HideRows);
