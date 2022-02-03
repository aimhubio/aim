import React from 'react';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import './HideRowsPopover.scss';

function HideRowsPopover({
  toggleRowsVisibility,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='HideRowsPopover'>
        <MenuItem onClick={() => toggleRowsVisibility([])}>
          Visualize All Rows
        </MenuItem>
        <MenuItem onClick={() => toggleRowsVisibility(['all'])}>
          Hide All Rows
        </MenuItem>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(HideRowsPopover);
