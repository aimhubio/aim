import React from 'react';
import { MenuItem, MenuList } from '@material-ui/core';

import { RowHeightEnum } from 'config/enums/tableEnums';

function RowHeight() {
  return (
    <MenuList>
      {Object.values(RowHeightEnum).map((value) => (
        <MenuItem key={value}>{value}</MenuItem>
      ))}
    </MenuList>
  );
}

export default React.memo(RowHeight);
