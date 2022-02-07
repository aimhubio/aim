import React from 'react';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { RowHeightSize } from 'config/table/tableConfigs';

import './RowHeightPopover.scss';

function RowHeightPopover({ rowHeight, onRowHeightChange }: any) {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default React.memo(RowHeightPopover);
