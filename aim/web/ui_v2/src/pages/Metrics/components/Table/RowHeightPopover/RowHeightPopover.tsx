import React from 'react';
import { MenuItem } from '@material-ui/core';

import { RowHeightEnum } from 'config/enums/tableEnums';

import './RowHeightPopover.scss';

function RowHeightPopover() {
  return (
    <div className='RowHeight'>
      {Object.values(RowHeightEnum).map((value) => (
        <MenuItem key={value}>{value}</MenuItem>
      ))}
    </div>
  );
}

export default React.memo(RowHeightPopover);
