import React from 'react';
import { MenuItem } from '@material-ui/core';

import './HideRowsPopover.scss';

function HideRowsPopover({
  toggleRowsVisibility,
  rowDataKeys,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='HideRowsPopover'>
      <MenuItem onClick={() => toggleRowsVisibility([])}>
        Visualize All Rows
      </MenuItem>
      <MenuItem onClick={() => toggleRowsVisibility([...rowDataKeys])}>
        Hide All Rows
      </MenuItem>
    </div>
  );
}

export default React.memo(HideRowsPopover);
