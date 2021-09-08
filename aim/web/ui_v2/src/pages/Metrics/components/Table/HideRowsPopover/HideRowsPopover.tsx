import React from 'react';
import { MenuItem, MenuList } from '@material-ui/core';

import './HideRowsPopover.scss';

function HideRowsPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='HideRowsPopover'>
      <MenuItem>Visualize All Rows</MenuItem>
      <MenuItem>Hide All Rows</MenuItem>
    </div>
  );
}

export default React.memo(HideRowsPopover);
