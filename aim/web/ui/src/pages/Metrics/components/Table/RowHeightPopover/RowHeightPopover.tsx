import React from 'react';

import { MenuItem } from '@material-ui/core';

import { RowHeightSize } from 'config/table/tableConfigs';

import './RowHeightPopover.scss';

function RowHeightPopover({ rowHeight, onRowHeightChange }: any) {
  return (
    <div className='RowHeight'>
      <MenuItem
        selected={rowHeight === RowHeightSize.sm}
        onClick={() => onRowHeightChange(RowHeightSize.sm)}
      >
        Small
      </MenuItem>
      <MenuItem
        selected={rowHeight === RowHeightSize.md}
        onClick={() => onRowHeightChange(RowHeightSize.md)}
      >
        Medium
      </MenuItem>
      <MenuItem
        selected={rowHeight === RowHeightSize.lg}
        onClick={() => onRowHeightChange(RowHeightSize.lg)}
      >
        Large
      </MenuItem>
    </div>
  );
}

export default React.memo(RowHeightPopover);
